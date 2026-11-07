# Identidade visual

> **Provisório.** Estes tokens são o ponto de partida até a SPEC SDD de identidade visual ser escrita. Quando ela existir, atualize **somente** o bloco `@theme` de `src/app/globals.css`; as telas não precisam mudar.

## Direção

- Referência de produto: Letterboxd, com marca própria (a ideia é algo como o que a Kick fez com a Twitch).
- Fundo escuro neutro, acento roxo profundo e tipografia sem serifa.

## O que não copiar

Marca, logotipos, textos, componentes visuais idênticos e a paleta original (verde e azul característicos).

## Tokens

### Marca

| Token | Valor | Uso |
| --- | --- | --- |
| `primary` | `#5B2A86` | Botões e ações principais (texto branco por cima) |
| `primary-hover` | `#8049B8` | Hover de ações principais |
| `primary-text` | `#A77BD6` | Links e acentos em texto sobre fundo escuro |
| `secondary` | `#F5B544` | Destaques quentes, como notas e estrelas |

O roxo `#5B2A86` tem bom contraste como fundo de botão, mas é escuro demais para texto sobre o fundo da página. Para texto, use `primary-text`.

### Superfícies e texto

| Token | Valor | Uso |
| --- | --- | --- |
| `background` | `#0E0E13` | Fundo da página |
| `surface` | `#16161D` | Cards, header |
| `surface-raised` | `#1E1E28` | Elementos elevados, placeholders |
| `border` | `#2A2A37` | Bordas |
| `foreground` | `#ECECF3` | Texto principal |
| `muted` | `#A3A3B5` | Texto secundário |
| `subtle` | `#7A7A8C` | Dicas e placeholders |

### Estados

| Token | Valor |
| --- | --- |
| `success` | `#34B27B` |
| `warning` | `#E8A33D` |
| `danger` | `#E5484D` |
| `info` | `#6E9BF5` |

## Como usar

Os tokens viram classes do Tailwind automaticamente:

```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary-hover">Buscar</button>
<p className="text-muted">Texto secundário</p>
<div className="border border-border bg-surface rounded-card">...</div>
```

Não use cores soltas (`#fff`, `bg-purple-700`). Se faltar um token, adicione-o ao `@theme` e documente aqui.

## Tipografia

Fonte sem serifa do sistema (`--font-sans`), sem dependência de rede. A fonte definitiva virá da SPEC.
