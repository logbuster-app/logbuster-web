---
name: LogBuster
description: A crítica brasileira de cinema impressa como cartaz do Cinema Novo, em que o argumento é o produto e o voto de mérito é o carimbo.
colors:
  vermelhao: "#E8452C"
  vermelhao-hover: "#F2573E"
  vermelhao-texto: "#F26B50"
  tinta: "#14100E"
  osso: "#EDE3CE"
  xilogravura: "#14100E"
  superficie: "#1D1814"
  superficie-elevada: "#271F1A"
  borda: "#4D4238"
  osso-apagado: "#B9AD97"
  osso-sutil: "#968B78"
  ocre-spoiler: "#E0A91A"
  perigo: "#FF8F80"
  sucesso: "#4CAF7D"
  info: "#7FB0FF"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 62"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 62"
  body:
    fontFamily: "Source Serif 4, Georgia, Times New Roman, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
  ui:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "0.025em"
rounded:
  card: "0"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "32px"
  control: "44px"
components:
  header-band:
    backgroundColor: "{colors.vermelhao}"
    textColor: "{colors.tinta}"
    height: "64px"
  button-primary:
    backgroundColor: "{colors.vermelhao}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.card}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.vermelhao-hover}"
  button-outline:
    backgroundColor: "{colors.xilogravura}"
    textColor: "{colors.osso-apagado}"
    rounded: "{rounded.card}"
    padding: "0 20px"
    height: "44px"
  input-field:
    backgroundColor: "{colors.xilogravura}"
    textColor: "{colors.osso}"
    rounded: "{rounded.card}"
    padding: "0 12px"
    height: "44px"
  merit-stamp-leader:
    backgroundColor: "{colors.vermelhao}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.card}"
    padding: "12px"
  merit-stamp-voted:
    backgroundColor: "{colors.osso}"
    textColor: "{colors.xilogravura}"
    rounded: "{rounded.card}"
    padding: "12px"
  merit-stamp-idle:
    backgroundColor: "{colors.xilogravura}"
    textColor: "{colors.osso}"
    rounded: "{rounded.card}"
    padding: "12px"
  rating-label:
    backgroundColor: "{colors.osso}"
    textColor: "{colors.xilogravura}"
    padding: "8px 16px"
  spoiler-warning:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.ocre-spoiler}"
    rounded: "{rounded.card}"
    padding: "16px"
  dialog:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.osso}"
    rounded: "{rounded.card}"
---

# Design System: LogBuster

## Overview

**Creative North Star: "Cartaz do Cinema Novo"**

A crítica brasileira de cinema impressa como cartaz: cor chapada, letra condensada pesada e cantos retos, como recortes de papel sobre preto quente de xilogravura. O argumento é o produto, então o voto de mérito é o elemento mais forte de cada análise. O mundo visual empresta só quatro coisas (tipografia, paleta, densidade e um gesto de assinatura); navegação e controles continuam padrões da web (select, botões, inputs).

Este sistema substituiu a identidade anterior (roxo e âmbar sobre grafite, sans de sistema, cartões de 12px arredondados). Os valores aqui concordam com `src/app/globals.css` (`@theme`) e com `docs/identidade-visual.md` (SPEC-UI-01), que é a tabela de tokens para a equipe. O reconhecimento sem conteúdo vem da faixa vermelha do cabeçalho, dos blocos chapados e dos contornos de 2px.

**Key Characteristics:**
- Fundo preto quente, texto em osso (nunca branco puro), vermelhão chapado para marca, ação e mérito.
- Títulos em Archivo condensado a 62%, peso 900, caixa alta; leitura longa em serifa.
- Cantos retos, bordas de 2px, sem sombras e sem gradientes.
- Estado dito por forma e peso (bloco cheio, bloco osso, contorno), não só por cor.
- Sem cartões aninhados: itens de lista são linhas separadas por régua.

## Colors

Paleta de cartaz de duas tintas mais papel: vermelhão e osso sobre preto, com um único ocre reservado a um alerta.

### Primary
- **Vermelhão de Urucum** (`colors.vermelhao`, token `primary`): faixa do cabeçalho, botões principais (Buscar, Avaliar filme, Publicar avaliação, Continuar escrevendo), carimbo de mérito líder. Texto sobre ele é sempre tinta preta (4,75:1).
- **Vermelhão Aceso** (`colors.vermelhao-hover`, `primary-hover`): hover de superfícies primárias.
- **Vermelhão de Texto** (`colors.vermelhao-texto`, `primary-text`): links, hover de texto, cursor e anel de foco sobre fundo escuro (5,6:1). O vermelhão cheio não serve de cor de texto sobre o preto.

### Secondary
- **Osso** (`colors.osso`, token `secondary` e `foreground`): texto principal, molduras fortes de 2px, estrelas e notas, etiqueta "Nota LogBuster", voto próprio do visitante.

### Tertiary
- **Ocre de Spoiler** (`colors.ocre-spoiler`, token `warning`): exclusivo de aviso de spoiler, do botão Spoiler e da confirmação de descarte no modal. Nunca em estrelas ou notas.

### Neutral
- **Preto de Xilogravura** (`colors.xilogravura`, `background`; mesmo valor da tinta `colors.tinta`, `primary-foreground`): fundo da página e tinta sobre superfícies vermelhas.
- **Superfície** (`colors.superficie`): campo de busca, painéis de estado, aviso de spoiler, diálogo.
- **Superfície Elevada** (`colors.superficie-elevada`): placeholder de pôster, esqueletos de carregamento, chips de destaque.
- **Borda** (`colors.borda`): divisórias suaves e bordas inativas.
- **Osso Apagado** (`colors.osso-apagado`, `muted`) e **Osso Sutil** (`colors.osso-sutil`, `subtle`): metadados; placeholders, estrelas vazias, "Sem poster".
- Estados: `colors.perigo` (erros, distinto do vermelhão da marca), `colors.sucesso`, `colors.info`.

### Named Rules
**The Ocre Is Spoiler Rule.** O ocre existe só para spoiler. Estrelas e notas usam osso.
**The Ink On Red Rule.** Sobre vermelhão ou osso o texto é tinta preta (`primary-foreground`); nunca osso sobre vermelhão.
**The Semantic Token Rule.** Telas usam só classes semânticas (`bg-surface`, `text-muted`, `bg-primary`); hex solto em `.tsx` é proibido.

## Typography

**Display Font:** Archivo, eixo de largura (`wdth`) a 62%, peso 900 (com fallback sans do sistema)
**Body Font:** Source Serif 4 (com Georgia, serif)
**UI Font:** Archivo normal (com sans do sistema)

**Character:** Letra de cartaz, condensada e gritada, contra uma serifa calma para quem vai ler uma análise inteira. Ambas hospedadas via `next/font/google`.

### Hierarchy
- **Display** (900, 48px mobile / 72px a partir de `sm`, 0.95): título do filme (`h1`).
- **Headline** (900, 36px, 0.95): títulos de seção ("Avaliações da comunidade"). Wordmark da faixa em 36px, "Avaliar filme" do modal em 30px.
- **Title** (900, 24px, 0.95): títulos de painel de estado, "Descartar sua análise?", número "(ano)" em 30 a 36px; contagem do carimbo em 48px.
- **Body** (400, 18px, 1.65): sinopse e texto das análises, serifa, medida de ~68ch (`max-w-[68ch]`).
- **UI** (400 a 700, 14px): metadados, descrições, campos.
- **Label** (700, 12px a 14px, 0.025em, caixa alta): rótulos de campo, botões, chips, ficha técnica.

### Named Rules
**The Poster Voice Rule.** A utilidade `font-display` (condensada, 900, caixa alta) é a voz de títulos e rótulos de destaque; texto corrido nunca a usa.
**The Reading Measure Rule.** Texto longo é serifa (`font-reading`) com no máximo ~68 caracteres por linha.

## Layout

Coluna única centrada, `max-w-6xl`, gutters de 16px (24px a partir de `sm`), padding vertical de 24px. A faixa do cabeçalho é de largura total; o conteúdo vive na coluna. A ficha do filme é uma grade de pôster (280px) mais texto (`md:grid-cols-[280px_1fr]`, vão de 40px), empilhada no mobile. A grade de resultados usa pôsteres 2:3. Ritmo em escala de 4px; alvos de toque mínimos de 44px (botões `h-11`/`min-h-11`, campos e select de 48px).

Seção de avaliações: régua de 2px em osso abre a seção; cada análise é uma linha separada por `border-t-2`, com a coluna do carimbo (9,5rem) à esquerda e o texto à direita (empilhados no mobile). Sem cartões dentro de cartões.

## Elevation & Depth

Sistema chapado: sem sombras e sem gradientes. A profundidade vem de contorno (2px), de blocos de cor cheia e de três degraus tonais (fundo, superfície, superfície elevada). O modal se separa da página por um véu do fundo a 90% e pela moldura de osso, não por sombra.

### Named Rules
**The Flat Print Rule.** Nenhum `box-shadow` e nenhum gradiente. Hierarquia por peso e forma.

## Shapes

Tudo é recorte de papel: `--radius-card: 0`, então `rounded-card` resulta em canto reto em botões, campos, painéis, diálogo e pôsteres. Bordas de 2px em osso (`border-foreground`) para molduras fortes e em `border` para as suaves; chips de destaque usam 1px. O único círculo é o spinner de carregamento. Ícones são SVG desenhados de traço único (`WarningIcon`, `StarIcon`, `ArrowLeftIcon`, `CloseIcon`); sem emoji.

## Components

### Buttons
- **Shape:** retos, 44px de altura (48px na busca e na ação da seção), texto em caixa alta, negrito, espaçamento de 0.025em.
- **Primary:** vermelhão chapado com tinta preta; hover para vermelhão aceso (Buscar, Avaliar filme, Publicar avaliação).
- **Outline:** contorno de 2px em osso (`foreground`), texto osso, ícone à esquerda e contador separado por um filete vertical; hover preenche de osso com texto escuro. Ativo: bloco osso com texto escuro (Curtir). Cancelar usa contorno em `border`, mais discreto, de propósito (ação que descarta).
- **Spoiler:** mesmo formato do Curtir (contorno de osso, `WarningIcon`, contador separado); hover e ativo em ocre (bloco ocre com texto escuro quando ativo).
- **Foco:** contorno de 2px em `primary-text` com offset de 2px (`:focus-visible`). Movimento: só transições curtas de cor; `prefers-reduced-motion` respeitado.

### Inputs / Fields
- **Style:** fundo `background` (no modal) ou `surface` (busca), borda de 2px, cantos retos, 44 a 48px. Busca com borda de osso e botão Buscar colado à direita. Textarea de análise em serifa.
- **Focus:** borda passa a osso no modal, mais o anel global.
- **Error:** painel com borda de 2px em `danger` e texto `danger`, com `role="alert"`.

### Navigation
Faixa vermelha de largura total, 64px, só com o wordmark "LogBuster" em display (Buster em osso). A ficha do filme volta à busca pelo link "Voltar para a busca" (`primary-text`, caixa alta, com `ArrowLeftIcon`). Adaptação consciente: o contrato previa busca na faixa do cabeçalho; a build entrega só o wordmark, e a busca vive na página inicial.

### Cards / Containers
Pôsteres 2:3 com borda de 2px (`border` na grade, osso na ficha), título em caixa alta de 14px abaixo, ano apagado; hover leva a borda e o título a `primary-text`. Painéis de estado (`StateMessage`): borda de 2px em `border` ou `danger`, fundo `surface`, título em display. Sem sombras, sem aninhar cartões.

### Carimbo de Mérito (assinatura)
O botão "Bem argumentada" do `ReviewCard` é um bloco grande com duas partes: o corpo (rótulo, contagem em display de 48px e a palavra "voto(s)") e uma **faixa de ação** embaixo ("+ Votar", ou "✓ Votado" quando o visitante já votou), que mostra que o carimbo é um botão e que o número é um contador. Fica na coluna esquerda da análise (empilhado no mobile). Estado por forma e peso: análise líder da ordenação por mérito = corpo vermelhão cheio com tinta preta e faixa preta; voto do próprio visitante = bloco osso com texto escuro e faixa escura; demais = contorno de osso com faixa osso. Líder votado pelo visitante ganha anel extra de osso.

### Nota LogBuster
"Nota LogBuster" é um bloco osso com texto preto, sem cantos, logo abaixo do título: a média em display de 72px seguida de "/ 5" em display de 36px (a escala fica sempre visível), separada por um filete preto do rótulo de 12px em caixa alta e de "(N avaliações)". Sem avaliações, o bloco mostra só o rótulo e "Ainda sem avaliações".

### Aviso de Spoiler e Modal
Aviso de spoiler: painel `surface` com borda de 2px em ocre, `WarningIcon`, título em caixa alta e link "Mostrar análise". Modal de avaliação: diálogo reto com moldura de osso de 2px, `max-w-xl`, cabeçalho separado por régua de 2px, rodapé separado por régua de 2px em `border`. Só fecha por Esc, Cancelar ou "×", nunca por clique fora. Fechar com texto digitado abre a confirmação "Descartar sua análise?" (borda ocre; "Continuar escrevendo" em vermelhão, "Descartar" em contorno); Esc de novo volta a editar.

## Do's and Don'ts

### Do:
- **Do** usar vermelhão para marca, ação principal e mérito; osso para texto, molduras e estrelas.
- **Do** dizer o estado por forma e peso (bloco cheio, bloco osso, contorno) além da cor.
- **Do** separar itens de lista por régua de 2px (`border-t-2`) em vez de cartões.
- **Do** manter cantos retos (`rounded-card`), bordas de 2px e alvos de 44px.
- **Do** compor texto longo em `font-reading` a ~68ch e títulos em `font-display`.
- **Do** desenhar ícones como SVG de traço único.

### Don't:
- **Don't** usar ocre fora de spoiler (nem em estrelas, notas ou realces genéricos).
- **Don't** usar roxo, âmbar, cartões arredondados de 12px, sombras ou gradientes: pertencem à identidade anterior.
- **Don't** usar branco puro, hex solto em `.tsx` ou emoji.
- **Don't** aninhar cartões dentro de cartões.
- **Don't** colocar texto osso sobre vermelhão chapado.
- **Don't** usar `font-display` em texto corrido.

<!-- Não canonizado: o fallback "Sem poster" da ficha do filme repete o de PosterImage em marcação própria (divergência de implementação, não regra). Itens adiados e ausentes da build, não documentados como existentes: rascunhos salvos, truncamento com "Ler análise completa", toast de publicação, crítica em destaque na home, busca no cabeçalho. -->
