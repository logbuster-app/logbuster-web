# Perfil público e arquétipo do cinéfilo (SPEC-FRONT-09)

## Visão geral

A rota `/users/[id]` apresenta o perfil público de uma conta no LogBuster:

- **Fundo (banner 16:9):** imagem enviada pela pessoa (`background_image_url`) ou faixa chapada `bg-brand-800`.
- **Avatar quadrado sobreposto:** segue a prioridade foto enviada (`avatar_image_url`) → ilustração SVG do catálogo (`avatar-01` a `avatar-08` em `public/avatars/`) → inicial do nome em `font-display` sobre `bg-surface-raised`.
- **Identidade:** nome de exibição, data de entrada (`Entrou em mês de ano`) e bio em `font-reading`. O e-mail nunca é exposto.
- **Arquétipo do cinéfilo:** exibido para qualquer visitante quando a conta possui **3 ou mais avaliações** vinculadas, em bloco osso (`bg-foreground text-background`). Abaixo de 3 avaliações, mostra `"O arquétipo aparece a partir de 3 avaliações."`.
- **Histórico de avaliações:** lista paginada (`page_size=10`, da mais recente para a mais antiga) reaproveitando o `ReviewCard` (votos de mérito, curtidas e ocultação de spoiler por flag do autor/IA ou 10+ votos da comunidade) e identificando cada filme com `<MovieTitleLink />` (com fallback silencioso para `movie_id`).
- **Perfil inexistente:** IDs não encontrados (`404`) ou malformados (`422`) renderizam `src/app/users/[id]/not-found.tsx`.

## Edição pelo titular

O botão **Editar perfil** aparece exclusivamente quando `useSession().viewer?.userId === profile.userId`.

No modal (`ProfileEditModal`):

- **Bio:** até 160 caracteres com contador em tempo real; limpar o campo envia `null` no `PATCH /api/v1/users/me`.
- **Avatar do catálogo:** seletor acessível entre as 8 ilustrações geométricas em SVG (`avatar-01` a `avatar-08`) ou opção de usar a inicial do nome.
- **Foto e fundo (`ImageField`):** validação prévia no cliente (`image/jpeg`, `image/png` ou `image/webp`, até 8 MiB), envio binário direto no corpo do `PUT /api/v1/users/me/images/{avatar|background}` (sem `FormData` ou Base64) e remoção independente via `DELETE` (`204 No Content`). Em erro, a imagem anterior é preservada e a mensagem do backend aparece em alerta.
- **Recarga automática:** salvar ou alterar imagens recarrega o perfil público e o arquétipo.

## Implementação técnica

- `src/features/profile/`: tipos, validações, services (`fetchProfile`, `fetchAvatars`, `updateProfile`, `uploadProfileImage`, `deleteProfileImage`), hook `usePublicProfile` e componentes (`ProfileView`, `ProfileHeader`, `ArchetypeBadge`, `Avatar`, `ProfileEditModal`, `AvatarPicker`, `ImageField`).
- `src/features/movies/components/MovieTitleLink.tsx`: link para `/movies/{id}` consultando o título via `useMovieDetail`.
- `src/features/reviews/`: `fetchUserReviews`, `useUserReviews`, `UserReviewHistory` e `movieSlot` opcional no `ReviewCard`.
- `src/shared/lib/apiClient.ts`: suporte a corpo binário (`Blob`/`File`) e respostas `204` ou sem corpo.
- `public/avatars/avatar-01.svg` … `avatar-08.svg`: ilustrações na paleta "Cartaz do Cinema Novo".
