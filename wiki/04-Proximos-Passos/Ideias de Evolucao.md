# Ideias de Evolução (Backlog)

Este documento registra as melhorias solicitadas para o Manchete Express v2.

## Interface e Layout
- [x] **Separação de Previews**: No modo multiformato, os templates estão muito próximos. Envolver cada preview em um box ou aumentar o espaçamento/margem.
- [x] **Realinhamento de Controles**: Mover o botão de "Imagem Pura" (Hide Text) para o lado do botão "Ajustar à Tela" (Toggle Fit Mode).

## Editor e Sincronização
- [x] **Integração de Metadados**: Colocar os campos de Editoria (Eyebrow) e Subtítulo "dentro dos pacotes" (mais integrados ao fluxo de cada formato).
- [x] **Toggle de Auto-Sync**: Implementar um botão de alternância (toggle) para sincronizar textos automaticamente entre todos os formatos (global sync).

## Funcionalidades Técnicas
- [x] **Controle Manual de Contraste**: Transformar o "Contrast Boost" em um botão manual para que o usuário escolha quando aplicar o reforço de legibilidade (especialmente útil em templates de caixa).

## Correções de Consistência
- [x] **Safe Space no Template HERO**: Corrigir inconsistência onde o texto encosta na borda inferior ao ser arrastado para o limite do formato. Garantir uma margem mínima (Safe Space) no bottom.

## Carrossel ("História Completa")
- [x] **Consolidação de Template**: O "História Completa" será o único template para o formato carrossel, focado no consumo de conteúdo diretamente no Instagram.
- [x] **Visibilidade do Logo**: O logo deve aparecer apenas no último slide (e pode ser maior que o padrão).
- [x] **Padronização Visual**: Manter o mesmo estilo visual contínuo em todos os slides.
- [x] **Remoção de Controles Desnecessários**: Remover botões de "Manchete" e "Metadados" (eye toggles) que não fazem sentido no fluxo do carrossel.
- [x] **Ajustes de Entrelinha (Leading)**: Título do primeiro slide com fonte 1.3x e entrelinha 1.15x. Slides seguintes com fonte 0.85x e entrelinha 0.85x. Todos usam *Montagu Slab*.
- [x] **Seletor de Cores (Color Picker)**: Color pickers inline no painel "Configurações da História" no editor, com botões de layout (Degradê Inferior/Superior, Fundo Sólido).
- [x] **Lógica de Sincronização**: O "Auto-Sync" (Sincronizado) neste caso funciona apenas para as editorias.
- [x] **Estilo Capa Destaque**: Variação com degradê na parte superior ou inferior.
- [x] **Esquema de Cores Alternadas**: Duas cores alternando entre slides no modo Fundo Sólido.
- [x] **Fundo Colorido (Apenas Texto)**: Opção de layout com fundo colorido sólido.
- [x] **Instruções (Onboarding)**: Dica na página inicial sobre o formato "História Completa".

## Ideias Futuras
- [x] **Reordenar Slides do Carrossel**: Permitir drag-and-drop para reordenar as imagens/slides após o upload.
- [x] **Persistência com IndexedDB**: Migrar armazenamento de imagens do localStorage (limite ~5MB) para IndexedDB para suportar carrosseis com muitas fotos sem perda de dados.

---

> [!NOTE]
> Estes itens serão endereçados cirurgicamente, priorizando simplicidade e consistência visual entre editor e exportação.
