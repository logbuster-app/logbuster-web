# Contas e sessão (SPEC-FRONT-07)

## Fluxo

- `/register` cria uma conta com nome de exibição, e-mail e senha.
- Após o cadastro, o front efetua login automaticamente.
- `/login` autentica e restaura o usuário pela rota `GET /api/v1/auth/me`.
- A sessão fica em `localStorage/logbuster:session` com token, expiração e dados mínimos do usuário.
- O botão Sair limpa a sessão.

## Publicação com conta

O botão Avaliar continua visível na ficha do filme. Sem sessão, leva para `/login?next=/movies/{id}` e retorna ao filme após entrar.

Com sessão, o modal mostra `Publicando como {nome}`, não possui campo de nome e envia o payload sem `author_name`. O backend vincula a avaliação à conta pelo Bearer token.

Se uma publicação retornar `401`, o modal preserva nota, destaques, texto e spoiler e mostra a ação `Entrar de novo`.

## Cabeçalho

Deslogado, o cabeçalho mostra Entrar e Criar conta. Logado, mostra a inicial, o nome e um menu com Meu perfil (`/users/{userId}`) e Sair.

## Implementação técnica

- `src/features/auth/api/auth.ts`: cadastro, login e restauração do usuário.
- `src/shared/lib/session.ts`: leitura, gravação, expiração e limpeza da sessão.
- `src/shared/contexts/SessionContext.tsx`: `SessionProvider` e `useSession()`.
- `src/shared/api/clients.ts`: adiciona `Authorization: Bearer` nas chamadas autenticadas e limpa a sessão em `401` autenticado.
- `src/shared/components/AccountMenu.tsx`: menu de conta do cabeçalho.

## Testes

```bash
npm run check
npm run build
```
