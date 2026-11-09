# Identidade visual e Sistema de Design (SPEC-UI-01)

Documento oficial da identidade visual e sistema de design do **LogBuster**, conforme especificado em `SPEC-UI-01`.

A experiência visual é inspirada na clareza editorial e densidade cinematográfica do **Letterboxd** (foco em pôsteres `2:3`, fundo escuro imersivo e leitura confortável de críticas), com **identidade de marca própria** construída sobre **roxo profundo** (ações/marca) e **âmbar dourado** (notas/estrelas).

## Restrições de Marca (O que NÃO copiar)

Logotipos (três círculos característicos), textos proprietários, paleta original (`#14181C` + verde `#00E054` / azul `#40BCF4`) ou clones de layout pixel a pixel.

## Tokens Oficiais (`@theme` do Tailwind CSS v4)

Todos os tokens são declarados em `src/app/globals.css`. Telas e componentes consomem exclusivamente classes semânticas. **É terminantemente proibido o uso de cores hexadecimais arbitrárias nos componentes `.tsx`.**

### Marca

| Token | Classe Tailwind | Valor Hex | Aplicação Obrigatória |
| :--- | :--- | :--- | :--- |
| `primary` | `bg-primary` | `#5B2A86` | Botões e ações principais (Buscar, Avaliar, Publicar) |
| `primary-hover` | `hover:bg-primary-hover` | `#8049B8` | Estado hover de botões primários |
| `primary-foreground` | `text-primary-foreground` | `#FFFFFF` | Texto sobre superfície `bg-primary` |
| `primary-text` | `text-primary-text` / `border-primary-text` | `#A77BD6` | Links, anel de foco, acentos em texto e botões ativos |

### Destaque

| Token | Classe Tailwind | Valor Hex | Aplicação Obrigatória |
| :--- | :--- | :--- | :--- |
| `secondary` | `text-secondary` / `bg-secondary` | `#F5B544` | Estrelas (`0,5–5,0`), notas médias e destaque de mérito |
| `secondary-foreground` | `text-secondary-foreground` | `#1A1205` | Texto escuro sobre superfícies douradas |

### Superfícies e Texto

| Token | Classe Tailwind | Valor Hex | Uso |
| :--- | :--- | :--- | :--- |
| `background` | `bg-background` | `#0E0E13` | Fundo principal da página (`<body>`) |
| `surface` | `bg-surface` | `#16161D` | Header, cards de filme, cards de avaliação |
| `surface-raised` | `bg-surface-raised` | `#1E1E28` | Botões secundários, chips inativos, placeholder de pôster |
| `border` | `border-border` | `#2A2A37` | Divisórias e bordas de cards/inputs |
| `foreground` | `text-foreground` | `#ECECF3` | Títulos e corpo de texto principal |
| `muted` | `text-muted` | `#A3A3B5` | Metadados (ano, duração, data, autor) |
| `subtle` | `text-subtle` | `#7A7A8C` | Dicas auxiliares, estrelas vazias e texto "Sem poster" |

### Estados

| Token | Classe Tailwind | Valor Hex | Uso |
| :--- | :--- | :--- | :--- |
| `success` | `text-success` | `#34B27B` | Confirmação de ações e sucesso |
| `warning` | `text-warning` / `border-warning` | `#E8A33D` | Alerta de conteúdo com **Spoiler** |
| `danger` | `text-danger` / `border-danger` | `#E5484D` | Mensagens de erro (`StateMessage tone="danger"`) |
| `info` | `text-info` | `#6E9BF5` | Avisos informativos |

## Tipografia e Geometria

- **Fonte (`--font-sans`):** Família sem serifa nativa do sistema operacional (`ui-sans-serif, system-ui, -apple-system, sans-serif`), sem requisições externas de rede.
- **Raio de borda (`--radius-card`):** `0.75rem` (`rounded-card`) para cards, contêineres e botões; `rounded-full` para badges/chips de destaques.
- **Pôsteres:** Proporção cinematográfica obrigatória `aspect-[2/3]` com fallback centralizado "Sem poster" quando `posterUrl === null`.
- **Foco acessível:** Todo controle interativo exibe contorno com `--color-primary-text` em `:focus-visible`.
