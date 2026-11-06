# Fluxo de entrega (PR)

Todo PR de task deve conter:

- [ ] **Código** cobrindo a task.
- [ ] **Testes** passando, respeitando a cobertura mínima configurada em `vitest.config.mts`.
- [ ] **Docs** atualizadas: uma página em `docs/features/` para a feature e, se necessário, ajustes em Arquitetura ou Identidade visual.

## Checklist local

```bash
npm run check   # lint + tipos + testes com cobertura
npm run build   # garante que o build de produção passa
```

## CI

O workflow `.github/workflows/ci.yml` roda lint, tipos, testes com cobertura e build em todo PR. Se o repositório não for do GitHub, adapte os mesmos quatro passos ao CI usado pelo time.

## Cobertura mínima

Valores atuais em `vitest.config.mts`: 80% de linhas, funções e statements; 70% de branches. Ajuste em um único lugar caso o time defina outro limite.

## Revisão

A Task 1 é revisada por Elton e Thyago. Ao revisar, rode o projeto localmente e confira os estados da tela (carregando, vazio, erro).

## Dependências e auditoria

O `package.json` tem um `overrides` que fixa `minimatch` em `11.0.5`. Ele corrige a vulnerabilidade de negação de serviço (GHSA-g3hv-75wg-m249) que entrava pela cadeia do `@typescript-eslint`, usada só no lint. Não rode `npm audit fix --force`: ele rebaixa o `eslint-config-next` para a versão 15 e quebra o projeto. Antes de subir uma nova dependência, rode `npm audit` e confira se o resultado continua zerado.
