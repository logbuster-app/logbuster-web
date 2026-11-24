import Link from "next/link";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Review, ReviewHighlight } from "../types";
import { TimeMachine } from "./TimeMachine";

function makeReview(
  id: string,
  movieId: string,
  rating: number,
  highlights: ReviewHighlight[] = [],
  createdAt = "2026-11-20T12:00:00Z",
): Review {
  return {
    id,
    movieId,
    authorName: "Helena",
    rating,
    content: "SEGREDO DE SPOILER QUE NUNCA DEVE APARECER NA TELA",
    isSpoiler: true,
    highlights,
    counts: { like: 2, spoiler: 15, wellArgued: 5 },
    viewerInteractions: [],
    createdAt,
  };
}

describe("TimeMachine", () => {
  const fullReviews: Review[] = [
    makeReview("1", "tt0317248", 5.0, ["cinematography", "direction"], "2026-11-22T12:00:00Z"),
    makeReview("2", "tt0140888", 4.5, ["cinematography"], "2026-11-20T12:00:00Z"),
    makeReview("3", "tt2762506", 4.0, ["acting"], "2026-11-18T12:00:00Z"),
  ];

  it("percorre os 5 cartazes com botões e setas do teclado, sem nunca mostrar o texto das avaliações", async () => {
    const user = userEvent.setup();

    render(
      <TimeMachine
        displayName="Helena Glauber"
        archetype={{
          title: "Olhar de fotógrafo",
          description: "Destaca a fotografia em 67% das suas avaliações.",
        }}
        reviews={fullReviews}
        profileHref="/users/u1"
        renderMovie={(movieId, className) => (
          <Link href={`/movies/${movieId}`} className={className}>
            Cidade de Deus ({movieId})
          </Link>
        )}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "A jornada de Helena Glauber" }),
    ).toBeInTheDocument();

    // Cartaz 1 de 5: Filmes avaliados
    expect(screen.getByText("1 de 5")).toBeInTheDocument();
    expect(screen.getByText("Filmes avaliados")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(
      screen.queryByText(/SEGREDO DE SPOILER/i),
    ).not.toBeInTheDocument();

    // Avança com botão Próximo -> Cartaz 2 de 5: Nota média
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(screen.getByText("2 de 5")).toBeInTheDocument();
    expect(screen.getByText("Nota média")).toBeInTheDocument();
    expect(screen.getByText("4,5")).toBeInTheDocument();

    // Avança com seta direita -> Cartaz 3 de 5: O que você mais valoriza
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("3 de 5")).toBeInTheDocument();
    expect(screen.getByText("O que você mais valoriza")).toBeInTheDocument();
    expect(screen.getByText("Fotografia")).toBeInTheDocument();

    // Avança com seta direita -> Cartaz 4 de 5: O filme que você mais amou
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("4 de 5")).toBeInTheDocument();
    expect(screen.getByText("O filme que você mais amou")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Cidade de Deus (tt0317248)" }),
    ).toBeInTheDocument();

    // Avança -> Cartaz 5 de 5: Seu arquétipo (botão final vira link Voltar ao perfil)
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("5 de 5")).toBeInTheDocument();
    expect(screen.getByText("Seu arquétipo")).toBeInTheDocument();
    expect(screen.getByText("Olhar de fotógrafo")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Próximo" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /voltar ao perfil/i }).length).toBeGreaterThanOrEqual(2);

    // Volta com seta esquerda -> Cartaz 4 de 5
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("4 de 5")).toBeInTheDocument();
  });

  it("omite cartazes de destaque e arquétipo quando ausentes, ajustando o total para 3 cartazes", () => {
    const noHighlights = [
      makeReview("1", "tt0000001", 4.0, []),
      makeReview("2", "tt0000002", 4.0, []),
      makeReview("3", "tt0000003", 5.0, []),
    ];

    render(
      <TimeMachine
        displayName="Ana"
        archetype={null}
        reviews={noHighlights}
        profileHref="/users/u2"
        renderMovie={(movieId) => <Link href={`/movies/${movieId}`}>{movieId}</Link>}
      />,
    );

    expect(screen.getByText("1 de 3")).toBeInTheDocument();
  });

  it("exibe a mensagem de mínimo quando há menos de 3 avaliações", () => {
    render(
      <TimeMachine
        displayName="João"
        archetype={null}
        reviews={[makeReview("1", "tt0000001", 4.0), makeReview("2", "tt0000002", 5.0)]}
        profileHref="/users/u3"
        renderMovie={(movieId) => <Link href={`/movies/${movieId}`}>{movieId}</Link>}
      />,
    );

    expect(
      screen.getByText("A Máquina do Tempo aparece a partir de 3 avaliações."),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /voltar ao perfil/i })[0]).toHaveAttribute(
      "href",
      "/users/u3",
    );
  });
});
