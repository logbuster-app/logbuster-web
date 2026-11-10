# Instalação e execução

## Pré-requisitos

- Node.js 20.9 ou superior (recomendado 22 LTS) e npm.
- Backend LogBuster em execução, com a chave OMDb configurada no backend.

No Arch Linux:

```bash
sudo pacman -S nodejs npm
```

## Primeira execução

```bash
npm install
cp .env.example .env.local
# edite .env.local e configure NEXT_PUBLIC_API_BASE_URL
npm run dev
```

A aplicação sobe em <http://localhost:3000>.

## Variáveis de ambiente

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Origem do backend LogBuster | `http://localhost:8000` |
| `NEXT_PUBLIC_USE_API_MOCKS` | Usa mocks de avaliações | `false` |

> A chave da OMDb pertence à configuração do backend e não deve ser colocada em variáveis `NEXT_PUBLIC_*`. Configure o CORS do backend para permitir a origem do front.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos |
| `npm test` | Testes (uma execução) |
| `npm run test:watch` | Testes em modo observação |
| `npm run test:coverage` | Testes com cobertura e limite mínimo |
| `npm run check` | Lint, tipos e testes com cobertura (o mesmo que o CI roda) |
| `npm run docs` | Sobe esta documentação em <http://localhost:3000> (use outra porta se o dev estiver rodando: `npx docsify-cli serve docs -p 3001`) |
