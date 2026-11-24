# Destaques da comunidade (FRONT-11)

Seção da tela inicial para **descobrir filmes pela qualidade**: a pessoa escolhe um aspecto (Trilha Sonora, Fotografia, Roteiro, Atuação, Direção ou Efeitos Especiais) e vê os filmes que a comunidade mais elogiou nele. Usa os pontos de destaque que as avaliações já gravam. Depende do BACK-10.

## O que a tela faz

- A seção aparece na home **só quando não há busca digitada**, abaixo do campo de busca. Com `?q=` ativo ela some e a busca segue como sempre.
- Seis chips na ordem oficial (`HIGHLIGHTS`), com **um sempre selecionado**.
- **Padrão:** o primeiro aspecto, na ordem oficial, que tiver filmes. Se nenhum tiver, fica o primeiro (Trilha Sonora) com a mensagem de vazio.
- **URL:** o aspecto escolhido fica em `/?destaque=soundtrack` e sobrevive ao recarregar. Um valor inválido na URL é ignorado (vale o padrão).
- Grade com até 10 filmes, reaproveitando `MovieGrid` e `MovieCard` (clicar abre a ficha). A legenda é "N destaques em Aspecto".
- Chips são rádios nativos: `Tab` entra no grupo e as setas trocam de aspecto. Eles quebram de linha, então não há rolagem horizontal em 375 px.

| Estado | O que aparece |
| --- | --- |
| Carregando | Spinner "Carregando destaques", chips visíveis |
| Sucesso | Legenda e grade |
| Vazio | "Ninguém destacou *Aspecto* ainda…" com convite para avaliar |
| Erro | Mensagem neutra "Não foi possível carregar os destaques" e aviso de que a busca continua funcionando. Os chips continuam ativos, então tentar outro aspecto é uma nova tentativa |

Uma falha na seção nunca afeta a busca.

## Contrato com o backend (BACK-10)

`GET /api/v1/highlights/{highlight}/movies?limit=10`, público. O front sempre envia `limit=10`.

```json
{
  "items": [
    {
      "id": "tt0816692",
      "title": "Interestelar",
      "year": "2014",
      "poster_url": "https://...",
      "rating_avg": 4.67,
      "rating_count": 3,
      "highlight_count": 3
    }
  ]
}
```

- Não há `total` nem paginação: a lista já vem ordenada por contagem de destaques, depois por nota média e depois por `movie_id`.
- Todas as avaliações contam, inclusive as marcadas como spoiler.
- Aspecto sem filmes devolve `200` com `items: []`. Destaque inválido e `limit` fora de 1 a 20 devolvem `422`.
- Com a OMDb fora do ar o item vem com `title = id`, `year` e `poster_url` nulos. O mapper converte `year` nulo em texto vazio, e o card mostra o id como título.

## Como a tela decide o aspecto

`useHighlightedMovies(requested)` (`hooks/useHighlightedMovies.ts`):

- Com `?destaque=` válido, busca só esse aspecto.
- Sem ele, busca os **seis em paralelo** e escolhe o primeiro com filmes. Enquanto algum dos aspectos anteriores ainda não respondeu, continua em "carregando", porque só assim dá para saber qual é o primeiro.
- Se um aspecto falha e um posterior tem filmes, mostra o posterior. Se nenhum tem filmes e algum falhou, é **erro** (não dá para afirmar que está vazio).
- O que foi buscado fica guardado enquanto a tela está montada: depois da primeira carga, **trocar de chip é instantâneo** e não repete requisição. Aspecto que deu erro é buscado de novo ao voltar a ele.

## Decisões

- **Legenda "N destaques":** `N` é a soma de `highlight_count` dos filmes exibidos (ex.: "37 destaques em Fotografia"). Se a spec quiser outra leitura (por exemplo, o número de filmes), a mudança é uma linha em `HighlightsSection.tsx`.
- **`replace` em vez de `push`:** trocar de chip substitui a entrada do histórico, para o botão voltar não percorrer cada aspecto visitado.
- **Estado inicial antigo removido:** o painel "Comece sua busca" deu lugar à seção, já que o campo de busca está logo acima.
- **Nomes dos destaques em `shared/lib/highlights.ts`:** `reviews` e `movies` não podem importar uma da outra, então `HIGHLIGHTS`, `HIGHLIGHT_LABELS`, `Highlight` e `isHighlight` ficam em `shared`. A feature `reviews` continua exportando `REVIEW_HIGHLIGHT_LABELS` e `ReviewHighlight` com os mesmos nomes.

## Código

| Arquivo | Papel |
| --- | --- |
| `shared/lib/highlights.ts` | Os seis destaques, a ordem oficial, os nomes e `isHighlight` |
| `features/movies/api/highlightsClient.ts` | `fetchHighlightedMovies` e o mapper `toHighlightedMovie` |
| `features/movies/api/highlights.mock.ts` | Dados de demonstração |
| `features/movies/hooks/useHighlightedMovies.ts` | Escolha do aspecto, estados e guarda dos resultados |
| `features/movies/components/highlights/HighlightsSection.tsx` | Seção: lê e grava `?destaque=` e compõe os estados |
| `features/movies/components/highlights/HighlightChips.tsx` | Seis chips (rádios nativos) |
| `features/movies/components/search/MovieSearch.tsx` | Mostra a seção quando não há busca |

## Mock para desenvolvimento

Com `NEXT_PUBLIC_USE_API_MOCKS=true`, `fetchHighlightedMovies` usa `highlights.mock.ts`: Trilha Sonora vem **vazia** (mostra que o padrão pula para o primeiro aspecto com filmes) e Efeitos Especiais tem mais de 10 filmes (mostra o limite da grade).

## Testes

```bash
npm test -- src/features/movies src/shared/lib/highlights.test.ts
```

Cobrem o service (URL, `limit`, mapper, erros 422 e de rede, mock), o mock, o hook (padrão, vazio, falhas parciais, aspecto pedido, cache, cancelamento), os chips (ordem, seleção, teclado), a seção (legenda, URL, estados) e a home (seção some com busca ativa, busca funciona com os destaques em erro).

### Testado contra a API local

O `logbuster-api` foi executado localmente (PostgreSQL 16 e as migrations até a `0004`) com contas e avaliações de demonstração, e o `fetchHighlightedMovies` real foi exercitado contra ele:

- Ordem por contagem com desempate por nota (3 destaques com média 4,67 antes de 3 destaques com média 4,0).
- Avaliação marcada como spoiler contando no ranking.
- `limit` padrão de 10 com mais de 10 filmes no aspecto, e `limit=2`.
- Aspecto sem filmes devolvendo `[]`.
- `422` para destaque inválido e para `limit` 0 ou 21, no envelope `{ error: { message } }`.
- OMDb inacessível: itens com `title = id`, `year` e `poster_url` nulos.

Ainda **não** foi testado com a OMDb real (títulos e pôsteres) nem no deploy de teste.
