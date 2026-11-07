# Arquitetura

Organização por **features** sobre o App Router do Next.js. Cada domínio do produto vive em `src/features/<nome>` com tudo o que precisa (API, hooks, componentes, testes). O que é genérico fica em `src/shared`.

```text
src/
  app/                  Rotas e layout (finas: só compõem features)
  features/
    movies/
      api/              Acesso à API externa e mappers
      components/       Componentes da feature
      hooks/            Estado e efeitos da feature
      types.ts          Modelo de domínio
      index.ts          API pública da feature
    reviews/          Avaliações (backend FastAPI). Esqueleto pronto para as Tasks 3 e 4.
  shared/
    components/         UI genérica (SiteHeader, Spinner, StateMessage)
    config/             Variáveis de ambiente
    lib/                Utilitários (ApiError)
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

## Componentes de cliente e de servidor

Componentes que usam estado, efeitos ou `useSearchParams` começam com `"use client"`. A página inicial envolve a busca em `<Suspense>`, exigência do Next.js ao usar `useSearchParams`.

## Estado da busca na URL

A consulta fica em `/?q=termo`. Isso deixa a busca compartilhável e preserva o resultado ao recarregar ou voltar.


Para a regra de onde cada componente vai e a divisão das tasks, veja [Organização e divisão de tasks](organizacao.md).
