# Avaliações e Interações da Comunidade (SPEC-FRONT-03)

## O que a tela faz

Exibe na ficha do filme (`/movies/[id]`) a lista de análises críticas da comunidade vindas do Back-end (`logbuster-api`), permitindo ordená-las com foco na qualidade do argumento e reagir às análises com votos qualificados e proteção de spoilers.

- **Ordenação Central por Mérito (RN-01):** Ao carregar a seção, as avaliações vêm ordenadas por padrão por **`well_argued`** (*"Mais bem argumentadas"*), materializando o diferencial do produto. O usuário pode alternar no seletor entre:
  - `well_argued` — *Mais bem argumentadas* **(padrão)**
  - `most_liked` — *Mais curtidas*
  - `newest` — *Mais recentes*
  - `rating_desc` — *Maior nota*
  - `rating_asc` — *Menor nota*
- **Voto Qualificado e Toggle (RN-02):** Cada análise exibe botões com contadores em tempo real para:
  - **Bem argumentada** (`well_argued`)
  - **Curtir** (`like`)
  - **Spoiler** (`spoiler`)
  Clicar envia requisição com o cabeçalho `X-Visitor-Id`. Se o visitante ainda não votou, o voto é registrado e o contador incrementado; se já votou, é desmarcado (toggle) e o contador decrementado.
- **Proteção Ativa contra Spoilers (RN-03):** Se uma avaliação possuir a flag `isSpoiler: true` **ou** tiver recebido 3 ou mais sinalizações da comunidade (`counts.spoiler >= 3`), seu texto inicia oculto atrás de uma caixa de alerta. Clicar em **"Mostrar análise"** revela o conteúdo apenas naquele card local.
- **Identificação do Visitante (`X-Visitor-Id`):** Gerado como UUID v4 aleatório e persistido em `localStorage` sob a chave `logbuster:visitor_id`, permitindo manter as preferências de voto sem exigir autenticação prévia.
- **Desacoplamento e Suporte a Mocks:** Pode operar integrado aos endpoints reais do FastAPI (`/api/v1/movies/{id}/reviews` e `/api/v1/reviews/{id}/interactions`) ou através de mocks locais via `NEXT_PUBLIC_USE_API_MOCKS=true` (`reviews.mock.ts`).

## Componentes e Arquivos

| Arquivo | Papel |
| :--- | :--- |
| `src/features/reviews/components/ReviewList.tsx` | Contêiner da seção, orquestrando estados e seletor de ordenação |
| `src/features/reviews/components/ReviewCard.tsx` | Card da avaliação com proteção de spoiler e botões de toggle |
| `src/features/reviews/components/ReviewSortSelector.tsx` | Seletor acessível de ordenação |
| `src/features/reviews/components/StarRating.tsx` | Renderizador acessível de estrelas (`0,5–5,0`) com valor numérico |
| `src/features/reviews/hooks/useMovieReviews.ts` | Hook de busca, ordenação e registro de interações |
| `src/features/reviews/api/reviews.ts` | Cliente HTTP integrado ao backend com conversão `snake_case` → `camelCase` |
| `src/features/reviews/api/reviews.mock.ts` | Provedor mockado em memória para testes e desenvolvimento isolado |
| `src/features/reviews/types.ts` | Tipos de domínio, rótulos de destaques em português e opções de ordenação |
| `src/shared/lib/visitor.ts` | Gerador e recuperador do `X-Visitor-Id` |

## Testes

- `visitor.test.ts`: Criação, persistência e fallback de UUID do visitante.
- `reviews.mock.test.ts`: Todas as 5 opções de ordenação, desempates e lógica de toggle no mock.
- `reviews.test.ts`: Mapeamento `toReview`, chamadas GET/POST com cabeçalho `X-Visitor-Id` e delegação ao mock.
- `StarRating.test.tsx` e `ReviewSortSelector.test.tsx`: Acessibilidade e eventos de seleção.
- `ReviewCard.test.tsx`: Proteção de spoiler inicial por flag e por threshold `>= 3`, clique em "Mostrar análise" e cliques em cada botão de interação.
- `useMovieReviews.test.ts`: Ciclos de estado, troca de ordenação e feedback de erro de voto.
- `ReviewList.test.tsx`: Estados `loading`, `empty`, `error`, `success` e alertas de erro ao votar.
