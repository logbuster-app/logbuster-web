# Integração de filmes

O front consulta o backend LogBuster por meio de `src/features/movies/api/moviesClient.ts`.
A chave da OMDb fica no backend, que consulta a API externa e normaliza os dados.

- `GET /api/v1/movies?q=...&page=...` busca filmes e informa total e paginação.
- `GET /api/v1/movies/{id}` retorna a ficha e a nota média da comunidade.

Os serviços convertem os campos da API para os tipos de domínio usados pela interface.
Falhas são apresentadas como `ApiError`; um detalhe inexistente retorna `null`.
Configure `NEXT_PUBLIC_API_BASE_URL` com a origem do backend e permita a origem do
front no CORS do backend.
