# Histórico de Bugs (v2)

Este documento registra as correções críticas realizadas durante a evolução do Manchete Express, servindo de base para evitar regressões.

## Correções Estruturais

### BUG-020: Race Condition na Exportação
- **Problema**: O download disparava antes do canvas terminar de processar o Blob, causando rascunhos salvos com dados incompletos.
- **Resolução**: Envolvimento do `canvas.toBlob` em uma Promise awaitable em `services/canvasExport.js`.

### BUG-022: Desalinhamento de Texto (Baseline)
- **Problema**: Manchetes e editorias saíam com desalinhamento vertical variável dependendo da fonte.
- **Resolução**: Normalização do `ctx.textBaseline = 'top'` em todo o motor de renderização do Rich Text.

### BUG-016: Instabilidade no Crop (Modal)
- **Problema**: O modal de crop causava bugs de layout em telas mobile e proporções extremas (Stories).
- **Resolução**: Substituição do modal por edição **in-place** (diretamente no preview), garantindo estabilidade e fluidez.

### BUG-024: event.target.closest is not a function
- **Problema**: O blur handler disparava em alvos não-Element (ex: color picker).
- **Resolução**: Adicionado guard clause em `events.js` para validar o alvo do evento.

### BUG-025: QuotaExceededError no localStorage
- **Problema**: Imagens base64 dos slides excediam o limite de ~5MB do navegador.
- **Resolução**: Implementado fallback em `core.js` que persiste o estado sem imagens quando a quota é atingida.

### BUG-026: Subtítulo exibia "undefined" ao sair do foco
- **Problema**: `createSlideData` não inicializava os campos `subtitles` e `eyebrows`, causando erro ao carregar o slide.
- **Resolução**: Correção na criação da estrutura de dados em `handlers-upload.js`.

## Melhorias de UX e Visual

### BUG-008: Logo IFMG Achatado
- **Problema**: ViewBox do SVG não era quadrado, causando distorção em alguns navegadores.
- **Resolução**: Ajuste do ViewBox para `0 0 183 183` e adição de `preserveAspectRatio`.

### BUG-010: Blur Inconsistente (Preview vs Canvas)
- **Problema**: O efeito de desfoque aparecia no editor (CSS) mas não na exportação (Canvas).
- **Resolução**: Implementação de desfoque nativo no Canvas via `ctx.filter` e fallback de renderização manual.

### BUG-023: Persistência de Formatos Antigos
- **Problema**: Adição de novos formatos (ex: LinkedIn) não aparecia para usuários com cache antigo.
- **Resolução**: Lógica de `merge` profundo no carregamento do estado persistido.

### BUG-027: Texto cortado na exportação do carrossel
- **Problema**: O `boxY` ignorava fatores de escala da logo (2.2x) e headline (1.3x/0.85x).
- **Resolução**: Recálculo da altura real em `drawCarouselStory` considerando as escalas dinâmicas.

### BUG-028: Degradê superior não aparecia no preview
- **Problema**: Overlay CSS com `z-index: 0` ficava atrás da imagem de fundo.
- **Resolução**: Ajuste de `z-index: 1` para garantir a visibilidade do overlay.

### BUG-029: Cores do título não eram globais
- **Problema**: `saveStateToSlides` salvava cores individualmente por slide, quebrando a consistência visual.
- **Resolução**: Propagação de `storyColor1/2` para todos os slides do carrossel.

### BUG-030: Controles de layout aplicavam globalmente
- **Problema**: Escolhas de degradê/sólido afetavam todos os slides simultaneamente.
- **Resolução**: Alteração em `core.js` para suportar configurações de layout individuais por slide.

### BUG-031: Quebra de linha duplicada na exportação
- **Problema**: Ao exportar a imagem, uma quebra de linha simples digitada no editor era renderizada como uma linha em branco extra no canvas.
- **Causa**: `parseRichTextToLines` adicionava uma linha vazia entre todos os parágrafos depois de dividir o texto por `\n`, duplicando o espaçamento apenas na exportação.
- **Resolução**: Removida a linha vazia artificial em `services/richText.js`, preservando somente quebras vazias realmente digitadas pelo usuário.

### BUG-032: Botão de exportação travado em "Exportando..."
- **Problema**: Depois de clicar em PNG/JPG, o botão do modal podia permanecer desabilitado com o texto "Exportando..." até o modal ser aberto novamente.
- **Causa**: O modal só era fechado/restaurado após a etapa de salvamento no histórico, deixando a UI presa caso essa etapa demorasse ou ficasse pendente.
- **Resolução**: `app/handlers-export.js` agora fecha o modal assim que os downloads são gerados, bloqueia cliques duplicados e só restaura o botão se ele ainda estiver conectado ao DOM.

### BUG-033: Número/Destaque cortava textos na exportação
- **Problema**: O campo grande do template Número/Destaque ficava em uma linha única na exportação, cortando texto nas laterais, e o subtítulo podia sair pelo rodapé.
- **Causa**: A exportação desenhava o destaque com `ctx.fillText` sem quebra automática e calculava a caixa como se a logo ocupasse espaço lateral, embora ela seja vertical nesse template.
- **Resolução**: `services/canvasExportLayoutsB.js` passou a quebrar o destaque em múltiplas linhas e `services/canvasExportText.js` passou a calcular altura/largura considerando logo vertical, múltiplas linhas e padding do subtítulo.

### BUG-034: Preview e exportação divergiam no template Citação
- **Problema**: A frase e o subtítulo do template Citação apareciam alinhados à esquerda no preview, mas centralizados na exportação; a posição exportada também podia divergir por altura subestimada.
- **Causa**: O rich text do preview forçava `text-left`, e o cálculo genérico de caixa não contabilizava aspas, divisor e espaçamentos próprios do template.
- **Resolução**: `app/template-preview.js` centraliza o rich text em Citação e Número/Destaque, e `services/canvasExportText.js` inclui os elementos estruturais do template Citação no cálculo de altura.

---

> [!TIP]
> Para ver a lista completa de bugs históricos da v1, consulte [BUGS.md no histórico](file:///Users/leoruas/Desktop/gerador-de-manchetes-ifmg/wiki/historical/BUGS.md).
