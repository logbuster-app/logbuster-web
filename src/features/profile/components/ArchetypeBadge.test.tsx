import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArchetypeBadge } from "./ArchetypeBadge";

describe("ArchetypeBadge", () => {
  it("exibe título em destaque e descrição quando há arquétipo", () => {
    render(
      <ArchetypeBadge
        archetype={{
          title: "Crítico exigente",
          description: "Média de 2,1 estrelas: reserva as notas altas para poucos filmes.",
        }}
      />,
    );

    expect(screen.getByText("Arquétipo do cinéfilo")).toBeInTheDocument();
    expect(screen.getByText("Crítico exigente")).toBeInTheDocument();
    expect(
      screen.getByText("Média de 2,1 estrelas: reserva as notas altas para poucos filmes."),
    ).toBeInTheDocument();
  });

  it("exibe a mensagem de mínimo quando archetype é null", () => {
    render(<ArchetypeBadge archetype={null} />);

    expect(
      screen.getByText("O arquétipo aparece a partir de 3 avaliações."),
    ).toBeInTheDocument();
  });
});
