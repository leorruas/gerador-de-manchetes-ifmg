# Manchete Quality Gate

Use esta skill antes de entregar qualquer alteracao no projeto.

## Checklist obrigatorio

```bash
npm run check
rg -n "on(click|input|blur|change|drop|dragover|dragleave|mousedown|touchstart)=" app index.html
wc -l app/*.js services/*.js scripts/*.mjs
```

## O que conferir

- `npm run check` deve passar.
- Nenhum arquivo JS deve passar de 250 linhas.
- `index.html` e `scripts/check.mjs` devem concordar na ordem dos scripts.
- Nao deve haver handler inline em templates.
- Se mudou layout visual, faca smoke test no navegador.
- Se mudou exportacao, teste ao menos um fluxo de exportacao afetado.
- Se fechou ou criou divida tecnica, atualize `wiki/03-Manutencao/Problemas do Projeto.md`.

## Smoke test recomendado

1. Abrir `http://localhost:4173/`.
2. Recarregar a pagina.
3. Confirmar ausencia de erros no console.
4. Testar pelo menos um botao tocado pela mudanca.
5. Testar crop/exportacao se a mudanca passar por preview ou Canvas.
