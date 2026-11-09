# Instalação e execução

## Pré-requisitos

- Node.js 20.9 ou superior (recomendado 22 LTS) e npm.
- Uma chave gratuita da OMDb: <https://www.omdbapi.com/apikey.aspx>.

No Arch Linux:

```bash
sudo pacman -S nodejs npm
```

## Primeira execução

```bash
npm install
cp .env.example .env.local
# edite .env.local e preencha OMDB_API_KEY
npm run dev
```

A aplicação sobe em <http://localhost:3000>.

## Variáveis de ambiente

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `OMDB_API_KEY` | Chave da OMDb | vazio (a busca mostra erro de configuração) |
| `OMDB_BASE_URL` | URL base da OMDb | `https://www.omdbapi.com` |

> Variáveis `NEXT_PUBLIC_*` vão para o bundle do navegador. Isso é aceitável aqui porque a chave da OMDb é gratuita e a consulta é feita pelo front, como definido no escopo.

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
