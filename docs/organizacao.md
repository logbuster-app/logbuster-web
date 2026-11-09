# Organização do código e divisão de tasks

Esta página é a referência para onde cada coisa vai. Antes de criar um arquivo, confira aqui.

## Estrutura

```text
src/
  app/                        Rotas (Next.js). Arquivos finos: só montam componentes de features.
  features/
    movies/                   Épico de Filmes (busca, filme específico)
      api/                    Chamadas à OMDb e mappers
      components/             Componentes desta feature
      hooks/                  Hooks desta feature
      types.ts                Modelos de domínio
      index.ts                API pública (o que outras partes podem importar)
    reviews/                  Épico de Filmes (avaliações: leitura, nota, cadastro)
      api/                    Chamadas ao backend FastAPI
      components/             Componentes desta feature
      hooks/                  Hooks desta feature
      types.ts
      index.ts
  shared/
    components/               Componentes GENÉRICOS (botões, mensagens, spinner, header)
    config/                   Variáveis de ambiente
    lib/                      Utilitários sem regra de negócio
  test/                       Setup dos testes
```

## Onde colocar um componente

Pergunta: **esse componente é de um domínio do produto, ou serve para qualquer tela?**

| Se o componente... | Vai para... | Exemplo |
| --- | --- | --- |
| Fala de filmes ou avaliações | `src/features/<feature>/components/` | `MovieCard`, `ReviewList` |
| Serve para qualquer tela e não conhece filme | `src/shared/components/` | `Spinner`, `StateMessage`, `Modal` |
| É uma página/rota | `src/app/<rota>/page.tsx` (só compõe componentes) | `src/app/movies/[id]/page.tsx` |

Regras de dependência:

1. Feature importa de `shared`, nunca o contrário.
2. Uma feature **não importa de outra feature**. Se precisar, o código comum sobe para `shared`.
3. Fora de uma feature, importe só do `index.ts` dela, nunca de arquivos internos.
4. Componente que usa estado, efeito ou `useSearchParams` começa com `"use client"`.

## Divisão das tasks

| Task | Responsável | Feature | Onde criar |
| --- | --- | --- | --- |
| Task 1: busca de filmes (OMDb) | Marcos | `movies` | Pronto |
| Task 2: visualização de filme específico | Elton | `movies` | `features/movies/components/detail/MovieDetail.tsx` e rota `src/app/movies/[id]/page.tsx`; API `getMovieById` em `features/movies/api/omdb.ts` |
| Task 2 (nota do nosso backend) | Elton | `reviews` | `features/reviews/api/` (cliente da nota média) |
| Task 3: visualização de avaliações | Elton | `reviews` | `features/reviews/components/ReviewList.tsx`, `ReviewCard.tsx`, interações em `hooks/` |
| Task 4: cadastro de avaliações | Thyago | `reviews` | `features/reviews/components/ReviewModal.tsx`, POST em `features/reviews/api/` |

## Como começar sua task

1. Atualize o repositório e rode `npm run check`.
2. Crie a branch da sua task.
3. Coloque os arquivos nas pastas da tabela acima.
4. Se criar um componente genérico, pense se ele já não existe em `shared/components`.
5. Escreva testes ao lado do arquivo (`Nome.test.tsx`).
6. Atualize a documentação em `docs/features/` e, se mudar a estrutura, esta página.
7. Abra o PR seguindo [Fluxo de entrega (PR)](contribuindo.md).

Os arquivos `.gitkeep` nas pastas de `reviews` só existem para o Git manter as pastas. Pode apagar o `.gitkeep` quando criar o primeiro arquivo na pasta.
