# Identidade visual e Sistema de Design (SPEC-UI-01)

Documento oficial da identidade visual do **LogBuster**. A versão atual é o **Cartaz do Cinema Novo**, que substituiu a identidade anterior (roxo e âmbar sobre grafite).

## Conceito

A crítica brasileira de cinema impressa como cartaz do Cinema Novo: **cor chapada, letra condensada pesada e cantos retos**, como recortes de papel. O argumento é o produto, então o voto de mérito é o elemento mais forte de cada análise: o **carimbo** "Bem argumentada".

O mundo visual empresta só quatro coisas: tipografia, paleta, densidade e um gesto de assinatura (o carimbo de mérito). Navegação e controles continuam os padrões da web.

## Restrições de marca (o que NÃO copiar)

Logotipo de três círculos do Letterboxd, textos proprietários, paleta original (`#14181C` + verde `#00E054` / azul `#40BCF4`) e clones de layout pixel a pixel.

## Tokens oficiais (`@theme` do Tailwind CSS v4)

Todos os tokens ficam em `src/app/globals.css`. Telas e componentes usam **somente classes semânticas**. É proibido usar cores hexadecimais arbitrárias nos `.tsx`. Para mudar a identidade, edite apenas esse bloco.

### Marca

| Token | Classe Tailwind | Valor | Aplicação |
| :--- | :--- | :--- | :--- |
| `primary` | `bg-primary` | `#E8452C` | Faixa do cabeçalho, botões principais (Buscar, Avaliar, Publicar), carimbo de mérito |
| `primary-hover` | `hover:bg-primary-hover` | `#F2573E` | Hover de superfícies primárias |
| `primary-foreground` | `text-primary-foreground` | `#14100E` | Tinta preta sobre o vermelhão (contraste 4,75:1) |
| `primary-text` | `text-primary-text` | `#F26B50` | Links, hover e acentos em texto sobre fundo escuro |

### Destaque

| Token | Classe Tailwind | Valor | Aplicação |
| :--- | :--- | :--- | :--- |
| `secondary` | `text-secondary` | `#EDE3CE` | Estrelas e notas (osso). O ocre é exclusivo do aviso de spoiler |
| `secondary-foreground` | `text-secondary-foreground` | `#14100E` | Texto escuro sobre superfícies em osso |

### Superfícies e texto

| Token | Classe Tailwind | Valor | Uso |
| :--- | :--- | :--- | :--- |
| `background` | `bg-background` | `#14100E` | Fundo da página (preto quente de xilogravura) |
| `surface` | `bg-surface` | `#1D1814` | Campos de busca, painéis de estado, aviso de spoiler |
| `surface-raised` | `bg-surface-raised` | `#271F1A` | Placeholder de pôster, destaques, esqueletos de carregamento |
| `border` | `border-border` | `#4D4238` | Divisórias suaves e bordas inativas |
| `foreground` | `text-foreground` / `border-foreground` | `#EDE3CE` | Texto principal (osso, nunca branco puro), molduras fortes e etiqueta da nota |
| `muted` | `text-muted` | `#B9AD97` | Metadados (ano, data, rótulos) |
| `subtle` | `text-subtle` | `#968B78` | Placeholders, estrelas vazias, "Sem poster" |

### Estados

| Token | Classe Tailwind | Valor | Uso |
| :--- | :--- | :--- | :--- |
| `success` | `text-success` | `#4CAF7D` | Confirmação |
| `warning` | `text-warning` / `border-warning` | `#E0A91A` | Alerta de **spoiler** (ocre) |
| `danger` | `text-danger` / `border-danger` | `#FF8F80` | Erros (`StateMessage tone="danger"`), distinto do vermelhão da marca |
| `info` | `text-info` | `#7FB0FF` | Avisos informativos |

## Tipografia

Fontes hospedadas pelo `next/font` (baixadas no build, sem requisição externa no navegador):

| Papel | Fonte | Como usar |
| :--- | :--- | :--- |
| Títulos e rótulos de destaque | **Archivo** em largura 62% e peso 900 | Classe `font-display` (já aplica caixa alta) |
| Interface | **Archivo** normal | Padrão (`font-sans`) |
| Leitura (sinopse e análises) | **Source Serif 4** | Classe `font-reading`, com medida de até ~68 caracteres (`max-w-[68ch]`) |

## Geometria e componentes

- **Cantos retos:** `--radius-card` é `0`, então `rounded-card` resulta em canto reto. Sem sombras e sem gradientes.
- **Bordas de 2px** (`border-2`) em osso (`border-foreground`) para molduras fortes e em `border-border` para as suaves.
- **Carimbo de mérito** (`ReviewCard`): o botão "Bem argumentada" é um bloco com a contagem em letra grande ("15 votos") e uma faixa de ação embaixo ("+ Votar" ou "✓ Votado"), para ficar claro que é um botão. Análise líder da ordenação por mérito = bloco vermelho cheio; voto do próprio visitante = bloco osso; demais = contorno. Estado por forma e peso, nunca só por cor. "Curtir" e "Spoiler" têm ícone, contorno de osso e contador separado por filete.
- **Nota LogBuster** (`MovieDetail`): bloco osso com a média em display de 72px seguida de "/ 5" em display de 36px, e o rótulo e a contagem de avaliações ao lado, logo abaixo do título.
- **Pôsteres:** proporção `aspect-[2/3]` com fallback "Sem poster" quando não há URL ou a imagem falha (`PosterImage`).
- **Ícones:** SVG desenhado (`WarningIcon`, `StarIcon`, `ArrowLeftIcon`, `CloseIcon`, `PlusIcon`, `CheckIcon`, `ThumbUpIcon`), traço único. Sem emojis.
- **Foco acessível:** contorno de 2px em `primary-text` em `:focus-visible`.
- **Seleção de texto:** fundo vermelhão com texto escuro (`::selection`).
- **Movimento:** transições curtas de cor; `prefers-reduced-motion` é respeitado.
