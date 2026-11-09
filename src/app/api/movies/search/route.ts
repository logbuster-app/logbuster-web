import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/features/movies/server";
import { ApiError } from "@/shared/lib/errors";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;

  if (!query) {
    return NextResponse.json(
      { error: "O parâmetro de busca 'q' é obrigatório." },
      { status: 400 },
    );
  }

  try {
    const result = await searchMovies(query, page);
    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      const status = err.code === "config" ? 500 : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    return NextResponse.json(
      { error: "Erro interno ao processar a busca de filmes." },
      { status: 500 },
    );
  }
}
