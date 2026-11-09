import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MovieDetail } from "@/features/movies";
import { getMovieById } from "@/features/movies/server";
import { ReviewList } from "@/features/reviews";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const trimmedId = id ? id.trim() : "";

  if (!trimmedId) {
    return {
      title: "Filme não encontrado | LogBuster",
    };
  }

  try {
    const movie = await getMovieById(trimmedId);
    if (!movie) {
      return {
        title: "Filme não encontrado | LogBuster",
        description: "O filme solicitado não foi encontrado no catálogo.",
      };
    }

    const titleWithYear = `${movie.title}${movie.year ? ` (${movie.year})` : ""}`;

    return {
      title: `${titleWithYear} | LogBuster`,
      description:
        movie.plot ??
        `Confira ficha técnica, sinopse e avaliações da comunidade sobre ${movie.title} no LogBuster.`,
      openGraph: {
        title: `${titleWithYear} | LogBuster`,
        description:
          movie.plot ??
          `Confira ficha técnica e avaliações sobre ${movie.title} no LogBuster.`,
        images: movie.posterUrl ? [{ url: movie.posterUrl }] : [],
      },
    };
  } catch {
    return {
      title: "Detalhes do Filme | LogBuster",
    };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const trimmedId = id ? id.trim() : "";

  let movie = null;
  try {
    movie = trimmedId ? await getMovieById(trimmedId) : null;
  } catch {
    // Se ocorrer erro de rede/config no SSR, movie continua null
    // e o MovieDetail cuidará da exibição ou retry no client
  }

  if (trimmedId && movie === null) {
    // Not found do Next.js App Router (renderiza not-found.tsx)
    notFound();
  }

  return (
    <div className="py-6 sm:py-8">
      <MovieDetail movieId={trimmedId} initialMovie={movie}>
        <ReviewList movieId={trimmedId} />
      </MovieDetail>
    </div>
  );
}
