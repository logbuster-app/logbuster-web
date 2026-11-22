# Resumo da comunidade (IA)

Funcionalidade de IA da feature `reviews` (SPEC-FRONT-08). Se a IA falhar, a ficha do filme continua funcionando.

> **Spoiler com IA não é feito no front.** Pelo CR-02 do `logbuster-docs`, o backend analisa cada avaliação depois de publicada e marca `is_spoiler` sozinho. O modal publica direto, sem consultar a IA, e o `ReviewCard` oculta pelo `isSpoiler` ou pelos votos da comunidade.

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

## Organização do código

| Peça | Responsabilidade |
| --- | --- |
| `api/reviewAi.ts` | Service `fetchReviewSummary`, mapper `toReviewSummary` e timeout |
| `api/reviewAi.mock.ts` | Versão mockada (`NEXT_PUBLIC_USE_API_MOCKS=true`) |
| `hooks/useReviewSummary.ts` | Estado do bloco: `loading`, `hidden`, `unavailable` ou `ready` |
| `components/ReviewSummary.tsx` | Bloco "Resumo da comunidade" (painel `surface`, título em display, texto em serifa, chip "Gerado por IA" igual aos chips de destaque) |

## Testando sem o backend

Com `NEXT_PUBLIC_USE_API_MOCKS=true` e `npm run dev`, abra `/movies/tt0133093`:

- O filme tem 4 avaliações de demonstração, então o resumo aparece após ~1 s.
- Qualquer outro `tt...` sem 3 avaliações mockadas esconde o bloco de resumo.

## Contrato com o backend

Segue o [guia de IA do backend](https://github.com/logbuster-app/logbuster-api/blob/main/docs/endpoints/ia.md) (`logbuster-api`, SPEC-BACK-09). A rota é pública e responde sempre `200` para entrada válida; falha, demora ou provedor não configurado viram `unavailable`.

```json
// GET /api/v1/movies/{movie_id}/review-summary
{ "status": "ready", "text": "...", "generated_at": "2026-11-23T15:00:00Z" }
// fora de "ready", text e generated_at vêm null
```

Pontos do backend que afetam a tela:

- A primeira geração do resumo pode levar até ~20 s; depois vem do cache. Por isso o bloco tem loading próprio.
- O resumo é regerado após 3 avaliações novas (`REVIEW_SUMMARY_REGEN_THRESHOLD`). A tela não recarrega o resumo ao publicar: ele atualiza na próxima visita à ficha.
- Quem consulta durante uma geração em andamento recebe `unavailable`; ao recarregar depois, o resumo já está em cache.

## Testes

```bash
npm test -- src/features/reviews
npm run check
```
