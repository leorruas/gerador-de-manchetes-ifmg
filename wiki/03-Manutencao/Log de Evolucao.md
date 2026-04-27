# Log de Evolução

Este documento registra as principais mudanças, melhorias e decisões de design implementadas no Manchete Express.

## [2026-04-27] - Refinamento de UX e Edição Direta

### Adicionado
- **Floating Buttons**: Botões de controle de metadados (Editoria/Subtítulo) agora flutuam acima da `Headline Box`.
- **Olhinho (Imagem Pura)**: Nova funcionalidade no canto superior direito do preview para ocultar todos os textos e validar a composição da foto.
- **Contrast Boost**: Controle de contraste dinâmico para o template **Glass Box**, melhorando a legibilidade em imagens claras.
- **Ícones de Estado**: Uso de ícones `+` e `-` nos botões de metadados para indicar visualmente a ação de adicionar ou remover campos.
- **Expansão de Carrossel**: Corrigido e habilitado o botão de `+` no carrossel, permitindo adicionar novas imagens a qualquer momento durante a edição.

### Melhorado
- **Ergonomia de Arraste**: Os botões de controle de campos opcionais agora acompanham o movimento de arraste da caixa de texto, eliminando a necessidade de voltar ao painel lateral para ajustes finos.
- **Consistência Visual**: Padronização dos botões utilitários no canto superior direito de cada card de preview.
- **Edição Inline**: Otimização do tempo de resposta e fidelidade visual dos `textareas` de edição sobre o canvas.
- **Upload Global**: Centralização do input de arquivos no `index.html`, permitindo que a funcionalidade de "Adicionar Foto" funcione em todas as telas do aplicativo.

### Mudanças de Design
- Removido o acoplamento de botões de visibilidade de campo do painel de controle global para uma abordagem contextual (Floating Buttons) focada no objeto de edição.
