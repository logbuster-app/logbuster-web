# Arquitetura

Organização por **features** sobre o App Router do Next.js. Cada domínio do produto vive em `src/features/<nome>` com tudo o que precisa (API, hooks, componentes, testes). O que é genérico fica em `src/shared`.

```text
src/
  app/                  Rotas e layout (finas: só compõem features)
  features/
    movies/
      api/              Services da feature: chamadas HTTP e mappers
      server.ts         Entrada só-servidor (usa segredos); opcional
      components/       Componentes da feature
      hooks/            Estado e efeitos da feature
      types.ts          Modelo de domínio
      index.ts          API pública da feature
    reviews/          Avaliações (backend FastAPI). Esqueleto pronto para as Tasks 3 e 4.
  shared/
    components/         UI genérica (SiteHeader, Spinner, StateMessage)
    config/             Variáveis de ambiente
    api/                Instâncias do cliente HTTP (internalApi, backendApi)
    contexts/           Estado compartilhado entre features (MovieRatingContext)
    hooks/              Hooks genéricos de UI (useModalBehavior)
    lib/                Utilitários (apiClient, ApiError, visitor, format)
  test/                 Setup dos testes
docs/                   Esta documentação (Docsify)
```

## Regras

1. **Rotas são finas.** Arquivos em `src/app` apenas montam componentes de uma feature.
2. **Features expõem uma API pública** em `index.ts`. Fora da feature, importe só dela, nunca de arquivos internos.
3. **`shared` não importa de `features`.** A dependência vai sempre de feature para shared.
4. **Uma feature não depende de outra** diretamente. Se duas precisam do mesmo código, ele sobe para `shared`.
5. **Modelo de domínio próprio.** O front não usa o formato cru da API externa; converte com um mapper (ex.: `toMovieSummary`). Assim, trocar a OMDb por outra fonte afeta só a camada `api`.
6. **Testes ao lado do código** (`Arquivo.test.tsx`).
7. **Estilo só com tokens** (veja [Identidade visual](identidade-visual.md)).

## Camada de services (acesso a dados)

Equivale ao `HttpClient` + services do Angular:

```text
componente  →  hook (estado)  →  service da feature (api/)  →  cliente em shared/api  →  rede
```

1. **`shared/lib/apiClient.ts`** é o único lugar que chama `fetch`: URL base, query, headers, JSON, cancelamento e conversão de falhas em `ApiError` (`code` + `status`). Aceita headers dinâmicos e `onError` (interceptors).
2. **`shared/api/clients.ts`** cria as instâncias: `internalApi` (rotas `/api/*` do Next) e `backendApi` (FastAPI, já com `X-Visitor-Id`).
3. **Cada feature tem seus services em `api/`**: funções que conhecem só os endpoints da feature, chamam `internalApi`/`backendApi` e devolvem o **modelo de domínio** (via mapper). Nova consulta = nova função aqui.
4. **Componentes e hooks nunca usam `fetch`** nem o `apiClient` direto: só os services.
5. **Segredos só no backend.** As consultas de filmes usam `backendApi`; a chave OMDb é configurada apenas no LogBuster API. `features/movies/server.ts` expõe o mesmo serviço para Server Components.

### Como adicionar uma consulta nova

1. Tipo de domínio em `features/<x>/types.ts`.
2. Função em `features/<x>/api/` usando `backendApi` ou `internalApi`, com mapper e mensagens de erro em português.
3. Teste ao lado (`*.test.ts`), mockando `fetch`.
4. Hook em `hooks/` só se precisar de estado; depois, o componente.

## Componentes de cliente e de servidor

Componentes que usam estado, efeitos ou `useSearchParams` começam com `"use client"`. A página inicial envolve a busca em `<Suspense>`, exigência do Next.js ao usar `useSearchParams`.

## Estado da busca na URL

A consulta fica em `/?q=termo`. Isso deixa a busca compartilhável e preserva o resultado ao recarregar ou voltar.


Para a regra de onde cada componente vai e a divisão das tasks, veja [Organização e divisão de tasks](organizacao.md).
