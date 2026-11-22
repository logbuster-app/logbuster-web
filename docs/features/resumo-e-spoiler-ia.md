# Resumo da comunidade e sugestão de spoiler (IA)

Duas funcionalidades de IA da feature `reviews`. Ambas **só sugerem ou informam**: se a IA falhar, a ficha do filme e a publicação continuam funcionando.

## Resumo da comunidade

Bloco "Resumo da comunidade" na ficha do filme (`/movies/[id]`), acima da lista de avaliações. É um componente independente (`ReviewSummary`) que busca os dados por conta própria, então a ficha não espera por ele.

`GET /api/v1/movies/{movie_id}/review-summary`

| `status` do backend | O que a tela faz |
| --- | --- |
| `ready` | Mostra o texto, o aviso **"Gerado por IA"** e a data de geração |
| `insufficient_reviews` (menos de 3 avaliações) | **Esconde** o bloco |
| `unavailable` | Mensagem simples de indisponibilidade; a ficha segue normal |

- Enquanto carrega, o bloco mostra um spinner próprio e o aviso "A primeira geração pode levar alguns segundos". Depois da primeira vez, vem do cache.
- **Uma requisição por filme:** chamadas simultâneas para o mesmo filme compartilham a mesma requisição (`requestReviewSummary`). Sem isso, o modo de desenvolvimento do React (que roda os efeitos duas vezes) dispararia duas chamadas, e a segunda receberia `unavailable` do backend por haver uma geração em andamento.
- **Teto de 30 s** (`REVIEW_SUMMARY_TIMEOUT_MS`): se estourar, o bloco mostra a mensagem de indisponibilidade em vez de carregar para sempre.
- `generated_at` vem em **UTC** e é convertido para o horário local do navegador (`parseUtcDate` + `formatLocalDateTime` em `shared/lib/format.ts`). Se a string vier sem fuso, é tratada como UTC.
- Erro de rede, erro HTTP, resposta inesperada ou `ready` sem texto viram `unavailable`. Só o cancelamento da requisição é propagado.

## Sugestão de spoiler no modal

`POST /api/v1/reviews/spoiler-check` com `{ movie_id, content }`. Funciona sem login; `content` segue a validação da avaliação (10 a 2000 caracteres, já garantida por `validateReview` antes da chamada).

Fluxo ao clicar em **Publicar avaliação** (`ReviewModal`):

1. Valida o formulário. Se for inválido, nem chama a IA.
2. Se o autor **já marcou** "contém spoilers", não chama a IA (não há o que sugerir) e publica.
3. Chama o `spoiler-check`. O botão mostra "Verificando..." e o modal não fecha nesse intervalo.

| Resultado | O que acontece |
| --- | --- |
| `clear` ou `unavailable` | Publica direto, sem aviso |
| `suspected` | Mostra "Seu texto parece conter spoiler. Quer marcar como spoiler?" |

No aviso:

- **Marcar como spoiler** publica com `is_spoiler: true` (e marca o checkbox).
- **Publicar assim mesmo** publica com `is_spoiler: false`.
- **Voltar e editar** (ou `Escape`) fecha o aviso sem publicar e devolve o foco ao texto.

**Campos bloqueados:** enquanto a IA analisa e enquanto o aviso está aberto, os campos do formulário ficam desabilitados (`<fieldset disabled>`). O aviso vale para o texto que o autor viu, então ele não pode mudar por baixo, e o que é publicado é sempre o que foi analisado.

Se a publicação falhar depois de o autor decidir, ele não é perguntado de novo sobre o mesmo texto.

**Timeout próprio de 10 s** (`SPOILER_CHECK_TIMEOUT_MS`): se estourar, o resultado é tratado como `unavailable` e a avaliação é publicada. O service `checkSpoiler` nunca lança erro.

Nada é ocultado automaticamente. A regra de 3 ou mais votos de spoiler da comunidade continua valendo no `ReviewCard`.

## Organização do código

| Peça | Responsabilidade |
| --- | --- |
| `api/reviewAi.ts` | Services `fetchReviewSummary` e `checkSpoiler`, mapper `toReviewSummary` e timeout |
| `api/reviewAi.mock.ts` | Versões mockadas (`NEXT_PUBLIC_USE_API_MOCKS=true`) |
| `hooks/useReviewSummary.ts` | Estado do bloco: `loading`, `hidden`, `unavailable` ou `ready` |
| `hooks/useSpoilerCheck.ts` | Estado `checking` e chamada ao service |
| `components/ReviewSummary.tsx` | Bloco "Resumo da comunidade" (painel `surface`, título em display, texto em serifa, chip "Gerado por IA" igual aos chips de destaque) |
| `components/ReviewModal.tsx` | Fluxo de publicação com o aviso de spoiler |

## Testando sem o backend

Com `NEXT_PUBLIC_USE_API_MOCKS=true` e `npm run dev`, abra `/movies/tt0133093`:

- O filme tem 4 avaliações de demonstração, então o resumo aparece após ~1 s.
- No modal, escreva algo como "No final, o herói morre" para ver o aviso. Textos sem esse tipo de pista publicam direto.
- Qualquer outro `tt...` sem 3 avaliações mockadas esconde o bloco de resumo.

## Contrato com o backend

Segue o [guia de IA do backend](https://github.com/logbuster-app/logbuster-api/blob/main/docs/endpoints/ia.md) (`logbuster-api`, SPEC-BACK-09). As duas rotas são públicas e respondem sempre `200` para entrada válida; falha, demora ou provedor não configurado viram `unavailable`.

```json
// GET /api/v1/movies/{movie_id}/review-summary
{ "status": "ready", "text": "...", "generated_at": "2026-11-23T15:00:00Z" }
// fora de "ready", text e generated_at vêm null

// POST /api/v1/reviews/spoiler-check  (body: { "movie_id": "...", "content": "..." })
{ "status": "suspected" }
```

Pontos do backend que afetam a tela:

- A primeira geração do resumo pode levar até ~20 s (texto mais checagem de spoiler do próprio resumo); depois vem do cache. Por isso o bloco tem loading próprio.
- O resumo é regerado após 3 avaliações novas (`REVIEW_SUMMARY_REGEN_THRESHOLD`). A tela não recarrega o resumo ao publicar: ele atualiza na próxima visita à ficha.
- Quem consulta durante uma geração em andamento recebe `unavailable`; ao recarregar depois, o resumo já está em cache.
- Entrada inválida retorna `422`; no front isso também vira `unavailable`, já que o texto é validado antes (`validateReview`).

## Testes

```bash
npm test -- src/features/reviews
npm run check
```
