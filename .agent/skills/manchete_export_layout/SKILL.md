# Manchete Export Layout

Use esta skill quando alterar aparencia de templates visuais ou exportacao.

## Arquivos principais

- Preview HTML: `app/template-preview.js`
- Tokens compartilhados: `services/layoutTokens.js`
- Orquestrador Canvas: `services/canvasExport.js`
- Layouts Canvas A: `services/canvasExportLayoutsA.js`
- Layouts Canvas B: `services/canvasExportLayoutsB.js`
- Texto Canvas/rich text: `services/canvasExportText.js`

## Workflow

1. Identifique o `layoutType` em `constants.js`.
2. Antes de criar numero visual novo, procure token em `services/layoutTokens.js`.
3. Se o numero precisar existir no preview e no Canvas, crie token compartilhado.
4. Use `getScale()` e `px()` no preview.
5. Use `getCanvasScale()` ou `safeScale` no Canvas.
6. Confira `headline`, `eyebrow`, `subtitle`, logo, sombra, padding e line-height.

## Regras

- Preview e exportacao devem usar a mesma fonte de medidas sempre que possivel.
- Canvas nao deve ler DOM.
- Evite duplicar numeros magicos em `template-preview.js` e `canvasExportLayouts*.js`.

## Validacao

```bash
npm run check
```

Depois faca smoke test visual no browser e exporte pelo menos um formato afetado quando a mudanca mexer em Canvas.
