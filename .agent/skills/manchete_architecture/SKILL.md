# Manchete Architecture

Use esta skill antes de alterar arquivos estruturais do Manchete Express.

## Mapa mental

- `index.html` carrega scripts globais em ordem fixa. Se adicionar/remover arquivo JS, atualize tambem `scripts/check.mjs`.
- `app/core.js` guarda `state`, persistencia, slides e helpers centrais.
- `app/events.js` e a unica ponte entre HTML renderizado e handlers. Templates usam `data-action`, nunca `onclick`/`oninput`.
- `app/handlers-*.js` alteram estado e chamam `renderApp()`, `renderModals()` ou `schedulePersist()`.
- `app/template-*.js` devem renderizar markup e evitar regra de negocio.
- `services/layoutTokens.js` e a fonte de verdade para medidas compartilhadas entre preview HTML e Canvas.
- `services/canvasExport*.js` recriam a arte final em Canvas lendo `state`, sem ler o DOM.

## Regras

- Mudanca visual em template normalmente exige checar o Canvas equivalente.
- Mudanca em handler novo exige registro em `app/events.js` e `app/contracts.js`.
- Mudanca em arquivo JS novo exige atualizar ordem de scripts em `index.html` e `scripts/check.mjs`.
- Mantenha cada arquivo JS abaixo de 250 linhas.

## Validacao minima

```bash
npm run check
rg -n "on(click|input|blur|change|drop|dragover|dragleave|mousedown|touchstart)=" app index.html
```
