# Integração com a OMDb

Código em `src/features/movies/api/omdb.ts`.

## Como funciona

- `omdbRequest(params, signal?)`: chamada genérica. Injeta a chave, trata chave ausente, erro de rede, HTTP 401 e erro HTTP genérico, e lança `ApiError` com mensagem segura para a interface.
- `searchMovies(query, page, signal?)`: busca por texto (`s=`) filtrada por filmes (`type=movie`). Devolve `MovieSearchPage` já no modelo de domínio.
- `toMovieSummary(item)`: converte o item da OMDb para `MovieSummary` (`Poster: "N/A"` vira `posterUrl: null`).

## Comportamentos da API que o código trata

| Situação | Resposta da OMDb | Tratamento |
| --- | --- | --- |
| Nenhum resultado | `Response: "False"`, `Error: "Movie not found!"` | Lista vazia (não é erro) |
| Termo muito curto | `Error: "Too many results."` | `ApiError` pedindo termo mais específico |
| Chave inválida | `Error: "Invalid API key!"` ou HTTP 401 | `ApiError` do tipo `config` |
| Sem poster | `Poster: "N/A"` | `posterUrl: null` |

Cada página da busca traz até 10 resultados; `totalResults` vem como string e é convertido para número.

## Limites

A chave gratuita tem limite diário de requisições. Por isso a busca dispara **ao enviar o formulário**, não a cada tecla.

## Como adicionar uma nova consulta

1. Chame `omdbRequest({ i: "tt0133093", plot: "full" })` (exemplo: filme por id).
2. Crie o mapper do resultado para um tipo de domínio em `types.ts`.
3. Exporte pela API pública em `index.ts` e escreva testes mockando `fetch` (veja `omdb.test.ts`).
