# Guia para continuar o front

## Antes de começar

1. Siga [Instalação e execução](setup.md).
2. Rode `npm run check`. Tudo deve passar antes de você mexer em qualquer coisa.
3. Leia [Arquitetura](arquitetura.md) e [Organização e divisão de tasks](organizacao.md) (10 minutos).

## Receita: criar uma nova feature

A feature `reviews` já existe como esqueleto. Para outras features, siga a mesma forma.

Exemplo para avaliações (`src/features/reviews`):

```text
src/features/reviews/
  api/           Chamadas ao nosso backend (FastAPI) e mappers
  components/    Componentes da feature
  hooks/         Estado e efeitos
  types.ts       Modelo de domínio
  index.ts       API pública
```

Siga o mesmo padrão de `features/movies`: `ApiError` para falhas, mapper para o modelo de domínio, estados de carregando, vazio e erro, e testes ao lado do código.

## Sugestões por task

**Task 2 (filme específico):** crie a rota `src/app/movies/[id]/page.tsx` fina, e adicione em `features/movies` um `getMovieById` usando `omdbRequest({ i: id })`. Ligue o `MovieCard` à rota. Para a nota do nosso backend, crie o cliente em `features/reviews/api` ou em uma feature própria de ratings.

**Task 3 (avaliações):** feature `reviews` com leitura (GET) no backend e componentes de lista e de interação (LIKE, SPOILER, BEM ARGUMENTADA).

**Task 4 (cadastro de avaliação):** modal de cadastro na feature `reviews` (estrelas de 0 a 5, checkbox provisório de spoiler, descrição e ponto de destaque), integrado ao POST do backend. Quando o contrato do backend estiver definido, centralize a URL base em `shared/config/env.ts` (ex.: `NEXT_PUBLIC_API_BASE_URL`).

## Convenções

- Código e nomes em inglês; textos da interface e documentação em português.
- Componentes em `PascalCase.tsx`, hooks em `useAlgo.ts`.
- Estilo apenas com tokens ([Identidade visual](identidade-visual.md)).
- Nada de `any`; use `unknown` e estreite o tipo.
