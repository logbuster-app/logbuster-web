import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useReviewSummaryMock = vi.hoisted(() => vi.fn());
vi.mock("../hooks/useReviewSummary", () => ({ useReviewSummary: useReviewSummaryMock }));

import { ReviewSummary } from "./ReviewSummary";

describe("ReviewSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra loading dentro do bloco enquanto o resumo é gerado", () => {
    useReviewSummaryMock.mockReturnValue({ status: "loading" });
    render(<ReviewSummary movieId="tt0133093" />);

    expect(screen.getByRole("heading", { name: "Resumo da comunidade" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Gerando o resumo da comunidade");
    expect(screen.getByText(/pode levar alguns segundos/i)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Resumo da comunidade" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("mostra o texto, o aviso 'Gerado por IA' e a data convertida para o horário local", () => {
    useReviewSummaryMock.mockReturnValue({
      status: "ready",
      text: "A comunidade elogia a direção.",
      generatedAt: "2026-11-09T12:00:00Z",
    });
    render(<ReviewSummary movieId="tt0133093" />);

    expect(screen.getByText("A comunidade elogia a direção.")).toBeInTheDocument();
    expect(screen.getByText("Gerado por IA")).toBeInTheDocument();
    expect(screen.getByText(/^Gerado em/)).toBeInTheDocument();

    const expected = new Date("2026-11-09T12:00:00Z").toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
    const time = screen.getByText(expected);
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("datetime", "2026-11-09T12:00:00.000Z");
  });

  it("trata a data sem fuso como UTC", () => {
    useReviewSummaryMock.mockReturnValue({
      status: "ready",
      text: "Resumo.",
      generatedAt: "2026-11-09T12:00:00",
    });
    render(<ReviewSummary movieId="tt0133093" />);

    expect(document.querySelector("time")).toHaveAttribute("datetime", "2026-11-09T12:00:00.000Z");
  });

  it("omite a data quando ela é inválida, mas mantém o aviso de IA", () => {
    useReviewSummaryMock.mockReturnValue({
      status: "ready",
      text: "Resumo.",
      generatedAt: "não é data",
    });
    render(<ReviewSummary movieId="tt0133093" />);

    expect(screen.getByText("Gerado por IA")).toBeInTheDocument();
    expect(screen.queryByText(/^Gerado em/)).not.toBeInTheDocument();
    expect(document.querySelector("time")).toBeNull();
  });

  it("não renderiza nada com menos de 3 avaliações", () => {
    useReviewSummaryMock.mockReturnValue({ status: "hidden" });
    const { container } = render(<ReviewSummary movieId="tt0133093" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("mostra uma mensagem simples quando o resumo está indisponível", () => {
    useReviewSummaryMock.mockReturnValue({ status: "unavailable" });
    render(<ReviewSummary movieId="tt0133093" />);

    expect(screen.getByText(/indisponível no momento/i)).toBeInTheDocument();
    expect(screen.queryByText("Gerado por IA")).not.toBeInTheDocument();
  });
});
