# Máquina do Tempo — Retrospectiva do cinéfilo (SPEC-FRONT-10)

## Visão geral

A **Máquina do Tempo** (`/users/[id]/retrospectiva`) apresenta uma retrospectiva pública no estilo *Wrapped* sobre as avaliações vinculadas à conta, seguindo a estética **"Cartaz do Cinema Novo"** (blocos chapados em vermelhão, osso e superfície, cantos retos e números em `font-display`).

Tudo é calculado no front-end a partir do histórico público da conta — nenhuma alteração no backend é necessária.

## Regras principais

- **Acesso pelo perfil:** o botão **Máquina do Tempo** aparece em `/users/[id]` para qualquer visitante quando a conta tem **3 ou mais avaliações**.
- **Mínimo de 3 avaliações:** acessando `/users/[id]/retrospectiva` diretamente com menos de 3 avaliações, a tela mostra `"A Máquina do Tempo aparece a partir de 3 avaliações."` e um link de volta ao perfil.
- **Coleta paginada (`useUserReviewsAll`):** percorre `GET /api/v1/users/{user_id}/reviews` com `page_size=50` até o `total`, com teto de **4 páginas (200 avaliações mais recentes)**.
- **Proteção contra spoilers:** o texto (`content`) das avaliações nunca é lido nem renderizado na retrospectiva.
- **Sequência de cartazes (`computeTimeMachine` + `TimeMachine`):**
  1. **Filmes avaliados:** quantidade de `movie_id` distintos.
  2. **Nota média:** média das notas com uma casa decimal no padrão brasileiro (`4,5 / 5`).
  3. **O que você mais valoriza:** destaque (`highlights`) mais frequente, desempatando pela ordem oficial (*Trilha Sonora*, *Fotografia*, *Roteiro*, *Atuação*, *Direção*, *Efeitos Especiais*). Omitido se nenhuma avaliação tiver destaques.
  4. **O filme que você mais amou:** avaliação de maior nota, desempatando pela mais recente, com título e link via `<MovieTitleLink />` (fallback silencioso para `movie_id`).
  5. **Seu arquétipo:** bloco osso com título e descrição vindos do perfil. Omitido se `archetype` vier `null`.
- **Navegação acessível:** botões **Anterior** e **Próximo** (no último cartaz vira **Voltar ao perfil**), indicador `"2 de 5"`, região com `aria-live="polite"` e suporte completo às setas do teclado (`ArrowLeft` / `ArrowRight`) e `Tab`.
- **Falhas:** erros ao consultar perfil ou histórico exibem `"Não foi possível montar a retrospectiva."` com link de retorno ao perfil.

## Implementação técnica

- `src/features/reviews/timeMachine.ts`: função pura `computeTimeMachine(reviews)` e ordem oficial de desempate.
- `src/features/reviews/hooks/useUserReviewsAll.ts`: paginação automática até 200 itens.
- `src/features/reviews/components/TimeMachine.tsx`: sequência interativa de cartazes.
- `src/features/profile/components/ProfileHeader.tsx`: botão **Máquina do Tempo** condicionado a 3+ avaliações.
- `src/app/users/[id]/retrospectiva/`: rota pública compondo `profile`, `reviews` e `movies`.
