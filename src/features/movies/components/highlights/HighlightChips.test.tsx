import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HighlightChips } from "./HighlightChips";

describe("HighlightChips", () => {
  it("mostra os seis chips na ordem oficial", () => {
    render(<HighlightChips selected="soundtrack" onSelect={vi.fn()} />);

    const labels = screen.getAllByRole("radio").map((radio) => radio.closest("label")?.textContent);
    expect(labels).toEqual([
      "Trilha Sonora",
      "Fotografia",
      "Roteiro",
      "Atuação",
      "Direção",
      "Efeitos Especiais",
    ]);
  });

  it("marca só o aspecto selecionado", () => {
    render(<HighlightChips selected="acting" onSelect={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "Atuação" })).toBeChecked();
    expect(screen.getAllByRole("radio").filter((radio) => (radio as HTMLInputElement).checked)).toHaveLength(1);
  });

  it("sem aspecto definido, nenhum chip fica marcado", () => {
    render(<HighlightChips selected={null} onSelect={vi.fn()} />);

    expect(screen.getAllByRole("radio").some((radio) => (radio as HTMLInputElement).checked)).toBe(false);
  });

  it("avisa o aspecto escolhido ao clicar", async () => {
    const onSelect = vi.fn();
    render(<HighlightChips selected="soundtrack" onSelect={onSelect} />);

    await userEvent.click(screen.getByText("Direção"));

    expect(onSelect).toHaveBeenCalledWith("direction");
  });

  it("é navegável por teclado: Tab entra no grupo e as setas trocam de aspecto", async () => {
    const onSelect = vi.fn();
    render(<HighlightChips selected="soundtrack" onSelect={onSelect} />);

    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "Trilha Sonora" })).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(onSelect).toHaveBeenCalledWith("cinematography");
  });

  it("é um grupo nomeado para leitores de tela", () => {
    render(<HighlightChips selected="soundtrack" onSelect={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Aspecto do filme" })).toBeInTheDocument();
  });
});
