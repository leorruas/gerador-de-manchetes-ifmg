# 🐛 Histórico de Bugs (v2)

Este documento registra as correções críticas realizadas durante a evolução do Manchete Express, servindo de base para evitar regressões.

## 🔴 Correções Estruturais

### BUG-020: Race Condition na Exportação
- **Problema**: O download disparava antes do canvas terminar de processar o Blob, causando rascunhos salvos com dados incompletos.
- **Resolução**: Envolvimento do `canvas.toBlob` em uma Promise awaitable em `services/canvasExport.js`.

### BUG-022: Desalinhamento de Texto (Baseline)
- **Problema**: Manchetes e editorias saíam com desalinhamento vertical variável dependendo da fonte.
- **Resolução**: Normalização do `ctx.textBaseline = 'top'` em todo o motor de renderização do Rich Text.

### BUG-016: Instabilidade no Crop (Modal)
- **Problema**: O modal de crop causava bugs de layout em telas mobile e proporções extremas (Stories).
- **Resolução**: Substituição do modal por edição **in-place** (diretamente no preview), garantindo estabilidade e fluidez.

## 🟡 Melhorias de UX e Visual

### BUG-008: Logo IFMG Achatado
- **Problema**: ViewBox do SVG não era quadrado, causando distorção em alguns navegadores.
- **Resolução**: Ajuste do ViewBox para `0 0 183 183` e adição de `preserveAspectRatio`.

### BUG-010: Blur Inconsistente (Preview vs Canvas)
- **Problema**: O efeito de desfoque aparecia no editor (CSS) mas não na exportação (Canvas).
- **Resolução**: Implementação de desfoque nativo no Canvas via `ctx.filter` e fallback de renderização manual.

### BUG-023: Persistência de Formatos Antigos
- **Problema**: Adição de novos formatos (ex: LinkedIn) não aparecia para usuários com cache antigo.
- **Resolução**: Lógica de `merge` profundo no carregamento do estado persistido.

---

> [!TIP]
> Para ver a lista completa de bugs históricos da v1, consulte [BUGS.md no histórico](file:///Users/leoruas/Desktop/gerador-de-manchetes-ifmg/wiki/historical/BUGS.md).
