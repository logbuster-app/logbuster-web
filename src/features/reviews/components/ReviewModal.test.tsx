import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createReviewMock = vi.hoisted(() => vi.fn());
vi.mock("../api/reviews", () => ({ createReview: createReviewMock }));

import type { Review } from "../types";
import { ReviewModal } from "./ReviewModal";

const createdReview: Review = {
  id: "review-1",
  movieId: "tt0133093",
  authorName: "Thyago",
  rating: 4.5,
  content: "Uma análise suficientemente longa para publicação.",
  isSpoiler: true,
  highlights: ["direction", "visual_effects"],
  counts: { like: 0, spoiler: 0, wellArgued: 0 },
  viewerInteractions: [],
  createdAt: "2026-11-09T12:00:00Z",
};

describe("ReviewModal", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  async function fillValidForm() {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "4,5 de 5 estrelas" }));
    await user.click(screen.getByRole("button", { name: "Direção" }));
    await user.click(screen.getByRole("button", { name: "Efeitos Especiais" }));
    await user.type(screen.getByLabelText(/nome \/ apelido/i), "Thyago");
    await user.type(
      screen.getByLabelText(/sua análise/i),
      "Uma análise suficientemente longa para publicação.",
    );
    await user.click(screen.getByRole("checkbox", { name: /contém spoilers/i }));
    return user;
  }

  it("valida campos obrigatórios e não tenta publicar uma nota vazia", async () => {
    const user = userEvent.setup();
    render(<ReviewModal movieId="tt0133093" onClose={vi.fn()} onCreated={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Selecione uma nota");
    expect(createReviewMock).not.toHaveBeenCalled();
  });

  it("mantém o conteúdo e as seleções após falha do adapter", async () => {
    createReviewMock.mockRejectedValueOnce(new Error("Falha simulada"));
    render(<ReviewModal movieId="tt0133093" onClose={vi.fn()} onCreated={vi.fn()} />);
    const user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Falha simulada");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome \/ apelido/i)).toHaveValue("Thyago");
    expect(screen.getByLabelText(/sua análise/i)).toHaveValue(
      "Uma análise suficientemente longa para publicação.",
    );
    expect(screen.getByRole("button", { name: "Direção" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("checkbox", { name: /contém spoilers/i })).toBeChecked();
  });

  it("publica os campos normalizados, persiste o nome e notifica sucesso", async () => {
    createReviewMock.mockResolvedValueOnce(createdReview);
    const onCreated = vi.fn();
    render(<ReviewModal movieId="tt0133093" onClose={vi.fn()} onCreated={onCreated} />);
    const user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    await waitFor(() => {
      expect(createReviewMock).toHaveBeenCalledWith({
        movieId: "tt0133093",
        authorName: "Thyago",
        rating: 4.5,
        content: "Uma análise suficientemente longa para publicação.",
        isSpoiler: true,
        highlights: ["direction", "visual_effects"],
      });
      expect(onCreated).toHaveBeenCalledWith(createdReview);
    });
    expect(window.localStorage.getItem("logbuster:review_author_name")).toBe("Thyago");
  });

  it("pede confirmação antes de descartar um texto digitado", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ReviewModal movieId="tt0133093" onClose={onClose} onCreated={vi.fn()} />);

    await user.type(screen.getByLabelText(/sua análise/i), "Um argumento que não pode se perder.");
    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("Descartar sua análise?")).toBeInTheDocument();

    // Esc de novo volta a escrever e preserva o texto.
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Descartar sua análise?")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/sua análise/i)).toHaveValue("Um argumento que não pode se perder.");

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await user.click(screen.getByRole("button", { name: "Descartar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("fecha com Escape e com Cancelar quando não está enviando", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ReviewModal movieId="tt0133093" onClose={onClose} onCreated={vi.fn()} />);

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("não fecha ao clicar fora, para não perder o texto digitado", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ReviewModal movieId="tt0133093" onClose={onClose} onCreated={vi.fn()} />);

    await user.type(screen.getByLabelText(/sua análise/i), "Texto em andamento");
    await user.click(screen.getByRole("dialog").parentElement as HTMLElement);

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/sua análise/i)).toHaveValue("Texto em andamento");
  });

  it("preenche o nome salvo da última publicação", () => {
    window.localStorage.setItem("logbuster:review_author_name", "Thyago");
    render(<ReviewModal movieId="tt0133093" onClose={vi.fn()} onCreated={vi.fn()} />);

    expect(screen.getByLabelText(/nome \/ apelido/i)).toHaveValue("Thyago");
  });

  it("fecha com Escape e mantém o modal aberto enquanto envia", async () => {
    const onClose = vi.fn();
    createReviewMock.mockReturnValueOnce(new Promise(() => {}));
    render(<ReviewModal movieId="tt0133093" onClose={onClose} onCreated={vi.fn()} />);
    const formUser = await fillValidForm();

    await formUser.click(screen.getByRole("button", { name: "Publicar avaliação" }));
    await formUser.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});