# Visualização de Filme Específico (SPEC-FRONT-02)

## O que a tela faz

Permite que o usuário acerte ou clique em qualquer filme listado na busca (`MovieCard`) para abrir sua página detalhada (`/movies/[id]`), exibindo metadados cinematográficos completos e fornecendo a base para o ecossistema de avaliações da comunidade.

- **Navegação a partir do Card:** Clicar em qualquer card de filme navega diretamente para `/movies/<imdbID>`.
- **Ficha Técnica Completa:** Pôster em proporção fixa `aspect-[2/3]`, título, ano de lançamento, duração, gêneros em pílulas, direção, elenco e sinopse completa.
- **Normalização de Metadados OMDb (RN-02):** Valores `"N/A"` ou ausentes da API externa são convertidos para `null` (ou lista vazia em `genres`), apresentando fallbacks discretos na UI (como *"Sinopse não informada"*, *"Não informada"*, *"Sem poster"*) sem exibir a string literal `"N/A"`.
- **Nota da Comunidade LogBuster:** Bloco dedicado à nota média e contagem de avaliações, exibindo *"Ainda sem avaliações"* enquanto não houver registros.
- **Tratamento de Estados:** Gerencia explicitamente estados de carregamento (`Spinner`), filme não encontrado (`StateMessage` com link de retorno à busca) e erros de rede/serviço (`StateMessage tone="danger"`).
- **Desacoplamento Arquitetural (RN-04):** A feature `movies` não possui importação direta de `reviews`. A integração da seção de críticas ocorre via slot `children` montado na rota de página Next.js.

## Componentes e Arquivos

| Arquivo | Papel |
| :--- | :--- |
| `src/app/movies/[id]/page.tsx` | Rota do Next.js compondo `MovieDetail` e o slot de `ReviewList` |
| `src/features/movies/components/detail/MovieDetail.tsx` | Componente visual da ficha do filme em 2 colunas responsivas |
| `src/features/movies/components/search/MovieCard.tsx` | Card navegável acessível envolvido com `Link` para `/movies/[id]` |
| `src/features/movies/hooks/useMovieDetail.ts` | Hook de gerenciamento de ciclo de vida, estados e recarga |
| `src/features/movies/api/omdb.ts` | Função `getMovieById(id, signal)` e mapper `toMovieDetail` |
| `src/features/movies/types.ts` | Modelo de domínio `MovieDetail` |

## Testes

Cobertura com Vitest e Testing Library:
- `omdb.test.ts`: Testa mapeamento de sucesso, normalização de campos `"N/A"`, filme inexistente (`null`), erros de chave/API e cancelamento de requisição.
- `MovieCard.test.tsx`: Garante presença do link acessível para `/movies/[id]` e renderização de pôster/fallback.
- `useMovieDetail.test.ts`: Valida transições de estado (`loading`, `success`, `not_found`, `error`) e função `reload`.
- `MovieDetail.test.tsx`: Verifica exibição de metadados, ausência da literal `"N/A"`, renderização de fallbacks e injeção de elementos no slot `children`.
- `page.test.tsx`: Valida a composição da rota recebendo os parâmetros da URL.
