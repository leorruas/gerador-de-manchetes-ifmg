# Log de Evolução

Este documento registra as principais mudanças, melhorias e decisões de design implementadas no Manchete Express.

## [2026-06-18] - Correções de Exportação

### Corrigido
- **Quebras de linha no canvas**: A exportação não insere mais uma linha vazia extra quando o usuário digita apenas uma quebra de linha no texto.
- **Estado do botão Exportar**: O modal de exportação fecha assim que os downloads são gerados, evitando que o botão permaneça preso em "Exportando..." enquanto o histórico é salvo.
- **Número/Destaque**: O texto principal do destaque agora quebra linha na exportação como no preview, sem corte lateral ou subtítulo escapando pelo rodapé.
- **Citação**: Frase e subtítulo ficam centralizados no preview, e a exportação usa a altura real do bloco com aspas, divisor e metadados.

## [2026-04-27] - Refinamento de UX e Edição Direta

### Adicionado
- **Floating Buttons**: Botões de controle de metadados (Editoria/Subtítulo) agora flutuam acima da `Headline Box`.
- **Olhinho (Imagem Pura)**: Nova funcionalidade no canto superior direito do preview para ocultar todos os textos e validar a composição da foto.
- **Contrast Boost**: Controle de contraste dinâmico para o template **Glass Box**, melhorando a legibilidade em imagens claras.
- **Ícones de Estado**: Uso de ícones `+` e `-` nos botões de metadados para indicar visualmente a ação de adicionar ou remover campos.
- **Expansão de Carrossel**: Corrigido e habilitado o botão de `+` no carrossel, permitindo adicionar novas imagens a qualquer momento durante a edição.
- **Migração de Histórico**: Transferência dos registros de bugs corrigidos (v2) do backlog de evolução para o histórico permanente.
- **Persistência Híbrida (v4)**: Implementação de armazenamento binário no **IndexedDB** para imagens, resolvendo o limite de 5MB do LocalStorage e permitindo carrosséis maiores.
- **Reordenação de Slides**: Adicionado suporte a Drag & Drop nos botões de navegação do carrossel para organizar a sequência das imagens.
- **Modularização de Persistência**: Extração da lógica de salvamento e migração para `persistence.js` e `imageStore.js`.

### Melhorado
- **Ergonomia de Arraste**: Os botões de controle de campos opcionais agora acompanham o movimento de arraste da caixa de texto, eliminando a necessidade de voltar ao painel lateral para ajustes finos.
- **Consistência Visual**: Padronização dos botões utilitários no canto superior direito de cada card de preview.
- **Edição Inline**: Otimização do tempo de resposta e fidelidade visual dos `textareas` de edição sobre o canvas.
- **Upload Global**: Centralização do input de arquivos no `index.html`, permitindo que a funcionalidade de "Adicionar Foto" funcione em todas as telas do aplicativo.
- **Upload de Arquivos Grandes**: Imagens enviadas agora são normalizadas para no máximo 2400px no maior lado e comprimidas antes de entrar no estado do editor.
- **Regressões Documentadas**: Corrigidos os pontos em que a implementação divergia da documentação: restauração de carrossel persistido, layout individual por formato e sincronização de manchetes sem copiar metadados.
- **Modularidade**: `core.js`, `template-preview.js` e `canvasExportLayoutsA.js` foram divididos em módulos menores para voltar a cumprir o contrato de `npm run check`.
- **IndexedDB para Imagens**: As imagens dos slides agora são salvas no IndexedDB, enquanto o `localStorage` guarda apenas metadados leves.
- **Reordenação do Carrossel**: As bolinhas de slides aceitam drag-and-drop para reorganizar a ordem das imagens após o upload.

### Mudanças de Design
- Removido o acoplamento de botões de visibilidade de campo do painel de controle global para uma abordagem contextual (Floating Buttons) focada no objeto de edição.
- **Controles de Layout Individuais**: Os botões de layout do carrossel (Degradê Inferior, Degradê Superior, Fundo Sólido) foram transferidos para a barra de ferramentas de preview e agora **operam individualmente para cada slide**, permitindo misturar diferentes estilos visuais no mesmo carrossel. As cores, por outro lado, permanecem globais.
