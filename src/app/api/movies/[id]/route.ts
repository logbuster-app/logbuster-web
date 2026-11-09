import { NextRequest, NextResponse } from "next/server";
import { getMovieById } from "@/features/movies/server";
import { ApiError } from "@/shared/lib/errors";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const trimmedId = id ? id.trim() : "";

  if (!trimmedId) {
    return NextResponse.json(
      { error: "O identificador do filme é obrigatório." },
      { status: 400 },
    );
  }

  try {
    const movie = await getMovieById(trimmedId);
    if (!movie) {
      return NextResponse.json(
        { error: "Filme não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(movie, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      const status = err.code === "config" ? 500 : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    return NextResponse.json(
      { error: "Erro interno ao buscar detalhes do filme." },
      { status: 500 },
    );
  }
}
