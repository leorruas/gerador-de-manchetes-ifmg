# Manchete UI Change

Use esta skill para adicionar ou alterar controles, botoes, inputs e modais.

## Workflow

1. Localize o template responsavel em `app/template-*.js` ou `app/templates-modals.js`.
2. Se precisar de interacao, adicione atributos `data-action`, `data-format-id`, `data-scope`, `data-id` ou `data-blur-action`.
3. Registre a acao em `app/events.js`.
4. Implemente o handler no arquivo certo:
   - Upload/drop/reset: `app/handlers-upload.js`
   - Exportacao/modais de exportacao/metadados: `app/handlers-export.js`
   - Historico: `app/handlers-history.js`
   - Edicao, templates, texto, zoom: `app/handlers-edit.js`
   - Drag, crop e posicao por teclado: `app/handlers-drag.js`
5. Adicione o nome publico em `app/contracts.js`.
6. Atualize wiki se a mudanca fecha ou cria uma regra estrutural.

## Nao fazer

- Nao adicionar `onclick`, `oninput`, `onchange`, `onblur` ou handlers inline.
- Nao colocar regra de negocio pesada dentro dos templates.
- Nao chamar exportacao Canvas a partir do template.

## Validacao

```bash
npm run check
rg -n "on(click|input|blur|change|drop|dragover|dragleave|mousedown|touchstart)=" app index.html
```
