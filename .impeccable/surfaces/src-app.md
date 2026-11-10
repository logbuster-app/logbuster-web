---
version: 1
slug: "src-app"
primary_target: "src/app"
related_targets: []
---

# Surface brief: LogBuster app (busca, ficha do filme, avaliações, modal)

Mode: Operate. Prazo: entrega em 2026-11-10, só o que já está implementado.

## Direction contract

THESIS: O argumento é o produto, e a crítica brasileira de cinema o imprime como cartaz do Cinema Novo: cor chapada, letra condensada pesada, carimbo de mérito. Recusa o painel escuro genérico com acento roxo e cards arredondados.

OWN-WORLD: Ground preto quente #14100E, osso #EDE3CE, vermelhão #E8452C (marca, ação, mérito), ocre #E0A91A só para aviso de spoiler. Letra condensada pesada (Archivo em largura 62%, peso 900) para título e rótulos; serifa de leitura (Source Serif 4) para sinopse e análises; Archivo normal para interface. Cantos retos, bordas de 2px em osso, sem sombras, sem gradientes. Reconhecível sem conteúdo: faixa vermelha de cabeçalho, blocos chapados, contornos grossos.

STORY: O crítico entende em segundos que aqui o argumento vale mais que a popularidade, lê análises longas com conforto e publica a sua com confiança.

FIRST VIEWPORT: Faixa vermelha cheia (72px) com o nome LogBuster à esquerda e a busca à direita. Abaixo, pôster 2:3 em moldura osso à esquerda e, à direita, título em letra condensada de ~64px, metadados, nota LogBuster em etiqueta osso, seletor de ordenação e a análise líder com carimbo vermelho de mérito. Ação principal "Avaliar filme" em vermelho.

FORM: Cartaz do Cinema Novo, candidata 4 da lista, seed:1402941215fce9db. Move de assinatura: o carimbo de mérito, bloco vermelho chapado com a contagem de "Bem argumentada", que marca a análise líder; estados por forma e peso, não só por cor.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints
Preservar funções, textos e regras de `AGENTS.md` (tokens semânticos, sem hex em .tsx). Sem funcionalidade nova. Contraste mínimo 4.5:1.
