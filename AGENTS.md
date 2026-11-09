# Regras para agentes (logbuster-web)

Next.js (App Router) + TypeScript + Tailwind. Antes de codar, leia `docs/arquitetura.md`.

## Obrigatório
- **Nunca use `fetch` em componente ou hook.** Dados passam por um service da feature (`src/features/<x>/api/`), que usa `internalApi` ou `backendApi` de `src/shared/api/clients.ts` (cliente em `src/shared/lib/apiClient.ts`).
- **Nunca coloque segredo em `NEXT_PUBLIC_*`.** A chave da OMDb é `OMDB_API_KEY` e só é lida no servidor via `features/movies/server.ts`. Componente `"use client"` não importa `server.ts` nem `api/omdb.ts`.
- Services devolvem **modelo de domínio** (camelCase, via mapper), nunca o JSON cru da API. Erros viram `ApiError` com mensagem em português.
- Features expõem API pública em `index.ts`; uma feature não importa outra; `shared` não importa de `features`.
- Teste ao lado do código. Estilo só com tokens (`docs/identidade-visual.md`).

## Antes de entregar
`npm run check` (lint + typecheck + testes com cobertura) e `npm run build` devem passar.
