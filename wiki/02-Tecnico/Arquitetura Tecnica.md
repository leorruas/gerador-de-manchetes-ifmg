# Arquitetura Técnica (v2 Modular)

O Manchete Express v2 utiliza uma arquitetura modular baseada em Javascript Vanilla, visando alta performance e facilidade de manutenção.

## Mapa de Arquivos

### Núcleo da Aplicação (`/app`)
| Arquivo | Responsabilidade |
| :--- | :--- |
| `core.js` | Definição do Estado Global (`state`) e funções de persistência. |
| `init.js` | Orquestração da inicialização e carregamento de estado. |
| `render.js` | Função `renderApp()` que coordena a atualização do DOM. |
| `contracts.js` | Verificação dos globais e handlers públicos usados pela camada de eventos. |
| `events.js` | Delegação central de eventos baseada em `data-action`, removendo handlers inline dos templates. |
| `preview-metrics.js` | Lógica de cálculo de zoom, pan e proporções para o editor. |
| `handlers-upload.js` | Processamento de arquivos, drag-and-drop e criação de slides. |
| `handlers-crop.js` | Lógica específica para o modo de reenquadramento (pan e zoom). |
| `handlers-export.js` | Lógica de disparo de exportação individual e em lote (carrossel). |
| `handlers-history.js` | Interação com o histórico (abrir, restaurar, deletar). |
| `handlers-edit.js` | Manipuladores de texto, sincronização por escopo no carrossel, zoom e mudanças de template. |
| `handlers-drag.js` | Lógica de arrasto (texto e crop) nos previews. |
| `handlers-slides.js` | Reordenação de slides via drag-and-drop no carrossel. |
| `persistence.js` | Lógica central de salvamento, migração (v1-v4) e hidratação de imagens. |

### Componentes de UI (`/app`)
| Arquivo | Responsabilidade |
| :--- | :--- |
| `template-welcome.js` | Tela inicial de upload e estatísticas. |
| `template-editor.js` | Painel de controle lateral (seleção de template, inputs). |
| `ps27-module.js` | Módulo do Processo Seletivo 2027: composição das camadas, edição direta de texto e exportação dos formatos sociais. |
| `template-preview.js` | Renderização do preview de cada formato (incluindo Glass Box). |
| `templates-modals.js` | Definição de Modals (Exportação, Histórico, Wizard). |

### Serviços de Baixo Nível (`/services`)
| Arquivo | Responsabilidade |
| :--- | :--- |
| `canvasExport.js` | Orquestrador da exportação para Canvas. |
| `layoutTokens.js` | Tokens compartilhados entre preview HTML e Canvas para reduzir divergencia visual. |
| `canvasExportText.js` | Lógica de desenho de textos com sombras e estilos. |
| `canvasExportLayouts*.js` | Implementação visual de cada template no Canvas. |
| `richText.js` | Parser de markdown para suporte a negrito/itálico no Canvas. |
| `historyDb.js` | Camada de persistência IndexedDB para rascunhos exportados. |
| `imageStore.js` | Camada de persistência IndexedDB exclusiva para imagens dos slides. |

### Assets PS27 (`/assets/ps27`)

As imagens extraídas dos SVGs do Processo Seletivo 2027 ficam em `assets/ps27/`. Os SVGs de origem ficam em `svgs - processo seletivo/`, e o script `scripts/extract-ps27-assets.mjs` recria os assets quando a exportação do Figma for atualizada.

## Fluxo de Dados

1. **Estado Centralizado**: Tudo o que o usuário vê (textos, zoom, posições) está no objeto `state` em `core.js`.
2. **Reatividade Manual**: Após qualquer mudança no `state`, chamamos `renderApp()` para refletir as mudanças no HTML.
3. **Persistência Híbrida (v4)**:
    - **Metadados**: Salvos no `localStorage` sob o `schemaVersion: 4`. As imagens são removidas do JSON antes do salvamento (`stripImagesFromState`).
    - **Imagens**: Armazenadas binariamente (Base64) no **IndexedDB** (`imageStore.js`) indexadas pelo ID do slide. Isso remove o limite de 5MB do LocalStorage.
    - **Sincronização**: Ao carregar, o sistema realiza a "hidratação", buscando as imagens no IndexedDB e mesclando com os metadados.
    - **Migração**: Detecta e migra automaticamente versões v1, v2 e v3 para o novo modelo híbrido.
4. **Eventos e Inputs Globais**: Elementos que precisam persistir entre trocas de tela (como o `<input type="file">` para adição de slides) são mantidos diretamente no `index.html`.
5. **Exportação**: O Canvas **não** lê o DOM. Ele reconstrói a imagem lendo diretamente o `state`.

## Qualidade e Limites

- `npm run check` valida a sintaxe de todos os arquivos JS com `node --check`.
- O mesmo comando falha se algum arquivo JS passar de 250 linhas.
- O mesmo comando falha se a ordem de `<script>` em `index.html` sair do contrato esperado.
- O upload limita o carrossel a 10 slides e aproximadamente 45 MB de imagens em Base64 para reduzir risco de travamento em navegadores com pouca memória.
- O estado salvo inclui `schemaVersion` para dar suporte a migrações futuras.

---

> [!IMPORTANT]
> **Nunca** procure lógica de renderização ou eventos no `index.js` da raiz. Ele agora é apenas um ponto de entrada simbólico. Toda a inteligência reside nas pastas `/app` e `/services`.
