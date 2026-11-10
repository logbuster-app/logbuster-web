# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primário: o crítico engajado.** Pessoa que escreve análises longas sobre filmes e quer que um bom argumento seja reconhecido, não apenas a nota ou a popularidade. Busca um filme, lê a ficha, lê as críticas da comunidade (ordenadas por mérito) e publica a própria análise com nota, destaques e marcação de spoiler.

Leitores casuais de críticas são audiência secundária: chegam pela busca, leem as análises mais bem argumentadas e reagem a elas.

Hoje o uso é anônimo: o visitante é identificado por um `X-Visitor-Id` (UUID em `localStorage`, chave `logbuster:visitor_id`), sem login.

## Product Purpose

Plataforma para registrar, avaliar e descobrir filmes, com inspiração de produto no Letterboxd e identidade própria. Existe para que críticas bem fundamentadas tenham mais visibilidade do que reações rápidas. Sucesso é o crítico engajado encontrar e escrever análises que a comunidade marca como "Bem argumentada".

Projeto desenvolvido na disciplina GP-2026.2 (UFAL), organizado por épicos e tasks com specs (`SPEC-FRONT-*`, `SPEC-UI-01`) e regras de negócio (`RN-*`).

## Positioning

**Mérito do argumento acima de popularidade.** As avaliações são ordenadas por padrão por "Mais bem argumentadas" (`well_argued`), e o voto qualificado "Bem argumentada" é uma interação de primeira classe ao lado de "Curtir" e "Spoiler". A proteção de spoiler é ativa e comunitária (flag do autor ou 3+ sinalizações ocultam o texto).

Diferenciais planejados que reforçam essa tese:
- **Análise de reviews com IA**, no estilo de como uma comunidade tipo Reddit destaca e resume discussões.
- **Detecção inteligente de spoiler:** a flag booleana de spoiler tratada como variável-alvo de um sistema inteligente que classifica o texto, em vez de depender só da marcação manual.

## Operating Context

- Fluxo central: busca por título (`/?q=termo`, dados da OMDb) → ficha do filme (`/movies/[id]`) → lista de avaliações → modal "Avaliar filme".
- Dados de filmes vêm da OMDb (chave só no servidor); avaliações, interações e nota média vêm do backend próprio FastAPI (`logbuster-api`, `/api/v1/...`).
- `NEXT_PUBLIC_USE_API_MOCKS=true` roda toda a feature de avaliações com mocks locais (demo em `/movies/tt0133093`).
- Interface e documentação em português (pt-BR); código em inglês. Documentação do time em `docs/` (Docsify).

## Capabilities and Constraints

**Existente (Épico de Filmes):**
- Busca por título com paginação "Carregar mais" e estados inicial/carregando/vazio/erro.
- Ficha do filme: pôster 2:3, título, ano, duração, gêneros, direção, elenco, sinopse; valores "N/A" da OMDb viram fallbacks em português. "Nota LogBuster" (média da comunidade, formato `4,8`) exibida uma única vez na ficha.
- Lista de avaliações com 5 ordenações (`well_argued` padrão, `most_liked`, `newest`, `rating_desc`, `rating_asc`), votos em toggle (Bem argumentada, Curtir, Spoiler) e ocultação de spoiler com "Mostrar análise".
- Cadastro de avaliação: nota 0,5–5,0 em passos de 0,5; nome/apelido 2–50 caracteres; análise 10–2000 caracteres com contador; spoiler opcional; até dois destaques (Trilha Sonora, Fotografia, Roteiro, Atuação, Direção, Efeitos Especiais). O modal não fecha ao clicar fora, para não perder texto.

**Planejado (decidido, ainda não implementado):**
- Contas e login.
- Perfis públicos com as críticas do usuário.
- Análise de reviews com IA e classificação inteligente de spoiler (ver Positioning).

**Restrições técnicas e de arquitetura** (detalhe em `AGENTS.md` e `docs/arquitetura.md`): Next.js App Router + TypeScript + Tailwind v4; dados só via services de feature; nenhum segredo em `NEXT_PUBLIC_*`; features isoladas entre si; `npm run check` e `npm run build` devem passar.

**Em aberto:** diário de filmes assistidos e listas pessoais não foram decididos.

## Brand Commitments

- Nome **LogBuster** (wordmark atual: "Log" + "Buster" com acento de marca).
- Inspiração de produto no Letterboxd, **sem copiar**: logotipo de três círculos, textos proprietários, paleta original (`#14181C`, verde `#00E054`, azul `#40BCF4`) ou layout pixel a pixel.
- Identidade visual oficial documentada em `docs/identidade-visual.md` (SPEC-UI-01); componentes usam somente tokens semânticos.
- Voz: português brasileiro, direto e funcional nos rótulos ("Buscar", "Avaliar filme", "Mostrar análise", "Mais bem argumentadas").

## Evidence on Hand

- Pôsteres e metadados reais via OMDb.
- Avaliações de demonstração em `src/features/reviews/api/reviews.mock.ts`.
- Não há usuários reais, depoimentos, métricas de uso ou imprensa. Não fabricar.

## Product Principles

1. **O argumento é o produto.** Toda tela que mostra críticas privilegia a qualidade da análise sobre volume ou popularidade.
2. **Proteger a experiência de quem ainda não viu.** Spoiler é tratado como risco real: oculto por padrão quando sinalizado, revelado só por escolha do leitor.
3. **Escrever é um ato valioso.** O fluxo de cadastro nunca descarta o texto do crítico (erros preservam campos, clique fora não fecha).
4. **Baixa fricção antes de identidade.** Ler, votar e escrever funcionam sem conta; login e perfis virão sem tornar o anonimato inútil.
5. **Honestidade com dados ausentes.** Metadados faltantes aparecem como fallbacks claros, nunca como "N/A" ou valores inventados.

## Accessibility & Inclusion

Requisitos já presentes no código e nas specs: foco visível em todo controle interativo, modal com foco preso e retorno de foco, `Escape` para fechar, controles de nota e ordenação acessíveis. Nenhum padrão formal (ex.: WCAG AA) foi declarado como obrigatório.
