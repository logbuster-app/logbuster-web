# Cadastro de avaliação (SPEC-FRONT-04)

## Modos de execução

O formulário da tela `/movies/[id]` pode ser testado sem iniciar o backend. Com `NEXT_PUBLIC_USE_API_MOCKS=true`, as operações usam `src/features/reviews/api/reviews.mock.ts`; a criação simula latência, retorna a resposta no formato `201` da API e atualiza a lista em memória.

Com `NEXT_PUBLIC_USE_API_MOCKS=false`, o service usa os endpoints reais:

- `POST /api/v1/reviews` para criar uma avaliação.
- `GET /api/v1/movies/{movie_id}/rating` para buscar a média e a quantidade agregadas.

Configure `NEXT_PUBLIC_API_BASE_URL` para a origem da API. O backend precisa permitir a origem do front via CORS. Como são variáveis `NEXT_PUBLIC_*`, reinicie o Next.js depois de alterá-las.

Para teste mockado, configure `NEXT_PUBLIC_USE_API_MOCKS=true` e inicie o front com `npm run dev`. Acesse `/movies/tt0133093` para usar as avaliações de demonstração.

## Formulário

- Nota obrigatória de `0,5` a `5,0`, em incrementos de `0,5`.
- Nome/apelido obrigatório entre 2 e 50 caracteres, após `trim()`. O último nome publicado é salvo localmente para facilitar a próxima avaliação.
- Análise obrigatória entre 10 e 2000 caracteres, após `trim()`, com contador visível.
- Marcação provisória de spoiler, desativada por padrão.
- Até dois destaques: Trilha Sonora, Fotografia, Roteiro, Atuação, Direção e Efeitos Especiais.

Em caso de erro no envio, o modal mostra a mensagem do backend em um alerta e preserva todos os valores preenchidos. Após `201`, fecha, insere imediatamente a avaliação retornada na lista e consulta novamente a média agregada do filme.

O modal fecha apenas por `Escape`, "Cancelar" ou "×" (bloqueados durante o envio). Clicar fora **não** fecha, para não perder o texto digitado. Enquanto aberto, o foco fica preso no diálogo, a página de fundo não rola e, ao fechar, o foco volta ao botão "Avaliar filme".

## Organização do código

Mesmo padrão da tela de filme específico: componentes só renderizam, a lógica fica em hooks e funções puras.

| Peça | Responsabilidade |
| --- | --- |
| `validation.ts` | `validateReview`: regras do formulário e payload normalizado (`trim`). Função pura, testada isoladamente. |
| `hooks/useCreateReview.ts` | Envio via service `createReview`, estado `submitting` e mensagem de erro. |
| `hooks/useMovieRating.ts` | Busca a nota média (`GET /movies/{id}/rating`) e publica no `MovieRatingContext`; `refresh()` após cadastrar. |
| `shared/hooks/useModalBehavior.ts` | `Escape`, foco preso, retorno de foco e trava de scroll. Reutilizável por qualquer modal. |
| `components/ReviewModal.tsx` | Estado dos campos e composição visual. |

A nota média é exibida **uma única vez**, na ficha do filme ("Nota LogBuster"), no formato brasileiro (`4,8`).

## Testes

```bash
npm test -- src/features/reviews
npm run check
npm run build
```
