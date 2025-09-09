# Documento de Bugs

Este documento rastreia os bugs identificados no projeto MancheteExpress, seu status e as resoluções aplicadas.

| ID | Descrição do Bug | Status | Notas de Resolução |
| :--- | :--- | :--- | :--- |
| **BUG-001** | `Uncaught SyntaxError: The requested module '.../constants.js' doesn't provide an export named: 'ExportIcon'`. O erro impedia a execução de qualquer script, resultando em uma tela preta no deploy. | **Fechado** | Corrigido refatorando as importações de módulos em `index.js` e `canvasExport.js` para usar "namespace imports" (`import * as ...`). Isso tornou a resolução de dependências mais robusta, contornando problemas de cache e carregamento de módulos no ambiente de hospedagem estática. |
