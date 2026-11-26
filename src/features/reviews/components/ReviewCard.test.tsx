import Link from "next/link";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Review } from "../types";
import { ReviewCard } from "./ReviewCard";

describe("ReviewCard", () => {
  const baseReview: Review = {
    id: "review-1",
    movieId: "tt0133093",
    authorName: "Thyago",
    rating: 4.5,
    content: "Texto detalhado da análise sem spoilers.",
    isSpoiler: false,
    highlights: ["direction", "visual_effects"],
    counts: {
      like: 4,
      spoiler: 0,
      wellArgued: 9,
    },
    viewerInteractions: ["well_argued"],
    createdAt: "2026-11-08T18:30:00Z",
  };

  it("renderiza autor, data, estrelas e badges de destaques em português", () => {
    render(<ReviewCard review={baseReview} />);

    expect(screen.getByText("Thyago")).toBeInTheDocument();
    expect(screen.getByText(/4,5/)).toBeInTheDocument();
    expect(screen.getByText("Direção")).toBeInTheDocument();
    expect(screen.getByText("Efeitos Especiais")).toBeInTheDocument();
    expect(screen.getByText("Texto detalhado da análise sem spoilers.")).toBeInTheDocument();
  });

  it("oculta o texto de avaliação com isSpoiler: true até o usuário clicar em 'Mostrar análise' (RN-03)", async () => {
    const user = userEvent.setup();
    const spoilerReview: Review = {
      ...baseReview,
      id: "review-spoiler",
      isSpoiler: true,
      content: "Spoiler crítico: o vilão é na verdade o mentor do herói.",
    };

    render(<ReviewCard review={spoilerReview} />);

    expect(screen.getByText("Esta avaliação contém spoiler")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /spoiler/i })).not.toBeInTheDocument();
    expect(
      screen.queryByText("Spoiler crítico: o vilão é na verdade o mentor do herói."),
    ).not.toBeInTheDocument();

    const button = screen.getByRole("button", { name: /mostrar análise/i });
    await user.click(button);

    expect(
      screen.getByText("Spoiler crítico: o vilão é na verdade o mentor do herói."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Esta avaliação contém spoiler")).not.toBeInTheDocument();
  });

  it("oculta o texto quando counts.spoiler >= 10 mesmo se isSpoiler for false (CR-02)", async () => {
    const user = userEvent.setup();
    const communitySpoilerReview: Review = {
      ...baseReview,
      isSpoiler: false,
      counts: {
        like: 1,
        spoiler: 10,
        wellArgued: 2,
      },
      content: "Spoiler sinalizado pela comunidade com 10 votos.",
    };

    render(<ReviewCard review={communitySpoilerReview} />);

    expect(screen.getByText("Esta avaliação contém spoiler")).toBeInTheDocument();
    expect(
      screen.queryByText("Spoiler sinalizado pela comunidade com 10 votos."),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /mostrar análise/i }));
    expect(
      screen.getByText("Spoiler sinalizado pela comunidade com 10 votos."),
    ).toBeInTheDocument();
  });

  it("mantém o texto visível com 9 votos de spoiler (abaixo do limiar do CR-02)", () => {
    const belowThresholdReview: Review = {
      ...baseReview,
      isSpoiler: false,
      counts: {
        like: 1,
        spoiler: 9,
        wellArgued: 2,
      },
      content: "Nove votos ainda não ocultam esta análise.",
    };

    render(<ReviewCard review={belowThresholdReview} />);

    expect(screen.getByText("Nove votos ainda não ocultam esta análise.")).toBeInTheDocument();
    expect(screen.queryByText("Esta avaliação contém spoiler")).not.toBeInTheDocument();
  });

  it("renderiza botões de interação com seus contadores e dispara onToggleInteraction ao clicar (RN-02)", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(<ReviewCard review={baseReview} onToggleInteraction={handleToggle} />);

    const wellArguedBtn = screen.getByRole("button", { name: /bem argumentada/i });
    const likeBtn = screen.getByRole("button", { name: /curtir/i });
    const spoilerBtn = screen.getByRole("button", { name: /spoiler/i });

    expect(wellArguedBtn).toHaveAttribute("aria-pressed", "true");
    expect(likeBtn).toHaveAttribute("aria-pressed", "false");
    expect(spoilerBtn).toHaveAttribute("aria-pressed", "false");

    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();

    await user.click(wellArguedBtn);
    expect(handleToggle).toHaveBeenCalledWith("review-1", "well_argued");

    await user.click(likeBtn);
    expect(handleToggle).toHaveBeenCalledWith("review-1", "like");

    await user.click(spoilerBtn);
    expect(handleToggle).toHaveBeenCalledWith("review-1", "spoiler");
  });

  it("exibe o movieSlot acima do cabeçalho mesmo quando o texto tem spoiler oculto", () => {
    render(
      <ReviewCard
        review={{ ...baseReview, isSpoiler: true }}
        movieSlot={<Link href="/movies/tt0133093">The Matrix</Link>}
      />,
    );

    expect(screen.getByRole("link", { name: "The Matrix" })).toBeInTheDocument();
    expect(screen.getByText(/4,5/)).toBeInTheDocument();
    expect(screen.getByText("Esta avaliação contém spoiler")).toBeInTheDocument();
  });

  it("o nome do autor leva ao perfil público quando a avaliação tem conta", () => {
    render(<ReviewCard review={{ ...baseReview, authorId: "user-42" }} />);

    const link = screen.getByRole("link", { name: "Thyago" });
    expect(link).toHaveAttribute("href", "/users/user-42");
  });

  it("avaliação anônima antiga mostra o nome sem link", () => {
    render(<ReviewCard review={{ ...baseReview, authorId: null }} />);

    expect(screen.getByText("Thyago")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Thyago" })).not.toBeInTheDocument();
  });

  it("mostra o aviso de verificação enquanto a IA analisa a avaliação", () => {
    render(<ReviewCard review={baseReview} analyzingSpoiler />);

    expect(screen.getByRole("status")).toHaveTextContent("Verificando spoiler com IA");
    // O texto não pode aparecer antes do veredito da IA.
    expect(screen.queryByText(baseReview.content)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mostrar análise/i })).not.toBeInTheDocument();
  });

  it("quando a verificação termina sem spoiler, o texto aparece", () => {
    const { rerender } = render(<ReviewCard review={baseReview} analyzingSpoiler />);
    rerender(<ReviewCard review={baseReview} analyzingSpoiler={false} />);

    expect(screen.getByText(baseReview.content)).toBeInTheDocument();
  });

  it("sem análise em andamento, não mostra o aviso", () => {
    render(<ReviewCard review={baseReview} />);

    expect(screen.queryByText(/Verificando spoiler com IA/)).not.toBeInTheDocument();
  });
});
