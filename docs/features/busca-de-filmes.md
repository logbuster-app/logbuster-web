# Busca de filmes (Task 1)

## O que a tela faz

- Campo de busca por título (envia ao clicar em Buscar ou pressionar Enter).
- Consulta GET à OMDb pelo front.
- Grid de resultados com poster, título e ano.
- Paginação por botão **Carregar mais** (10 por página).
- Estados: inicial, carregando, vazio, erro e erro ao carregar mais.
- A consulta fica na URL (`/?q=termo`).

## Componentes

| Arquivo | Papel |
| --- | --- |
| `components/search/MovieSearch.tsx` | Tela completa; lê `?q=` e orquestra os estados |
| `components/search/SearchBar.tsx` | Formulário de busca (acessível, ignora texto vazio) |
| `components/search/MovieGrid.tsx` | Grade responsiva de filmes |
| `components/search/MovieCard.tsx` | Card de um filme; **reutilizável** em outras telas |
| `hooks/useMovieSearch.ts` | Busca, paginação e status (`idle`, `loading`, `success`, `error`) |

## Pontos de extensão

- O `MovieCard` ainda não é clicável. A Task 2 (visualização de filme) pode envolvê-lo com um `Link` para `/movies/[id]`, usando `movie.id` (id IMDb).
- A nota média do nosso backend pode ser exibida no card quando o endpoint de nota média existir.

## Testes

`omdb.test.ts`, `SearchBar.test.tsx`, `MovieGrid.test.tsx` e `MovieSearch.test.tsx` cobrem a camada de API, os componentes e o fluxo completo com `fetch` mockado.
