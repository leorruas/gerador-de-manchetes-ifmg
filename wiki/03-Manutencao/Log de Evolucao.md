# Log de Evolução

Este documento registra as principais mudanças, melhorias e decisões de design implementadas no Manchete Express.

## [2026-08-05] - Módulo Processo Seletivo 2027 (PS27)

### Adicionado
- **Quebras manuais do subtítulo:** A prévia preserva as linhas inseridas com Enter ou Shift+Enter, sem hifenizar ou dividir palavras automaticamente. O canvas de exportação usa o mesmo conteúdo.
- **Módulo PS27**: Novo acesso amarelo na tela inicial, identificado como **“Processo Seletivo 27”**, sem substituir o fluxo principal de criação de manchetes.
- **Composição por camadas**: Os SVGs recebidos foram preservados em `svgs - processo seletivo/` e suas camadas foram extraídas para `assets/ps27/`: fundos, logo, estrela, slogans **Azul** e **Pink**, três adesivos de texto e os personagens Lucas, Paulo e Lavínia.
- **Prévia conjunta**: Instagram Post (1080×1350) e Instagram Story (1080×1920) são exibidos em sequência na mesma página, usando controles compartilhados para slogan, adesivo e personagem.
- **Edição direta**: O texto do PS27 é editável sobre as próprias artes, com quebra por palavras e também por palavras longas, para evitar vazamento na exportação.
- **Exportação do PS27**: Barra flutuante no padrão do Manchete Express; permite exportar Post ou Story em PNG e JPG. O JPG usa o serviço comum `canvasExport.downloadCanvas`.
- **Caixas de texto por formato**: A posição e a largura foram configuradas a partir das referências do navegador e são a mesma na prévia e na exportação: Post (7,96% / 75% / 70%) e Story (7,96% / 70% / 65%).
- **Entrelinhamento PS27**: `line-height: 1` aplicado tanto ao campo editável quanto ao canvas de exportação.
- **Informações de apoio e reinício**: Editoria e Subtítulo do PS27 usam a caixa contextual dentro do canvas, com botões flutuantes acima da caixa de texto, seguindo o padrão do Manchete Express; o rodapé passou a ter Novo Post e Exportar tudo.
- **Data e hora**: Adicionada a opção de exibir o novo adesivo de data/hora em amarelo, vermelho ou azul. Os campos Dia, Mês e Hora são limitados a dois dígitos numéricos e entram tanto nas prévias quanto nos arquivos exportados.
- **Portais PS27**: Adicionados Portal dos Campi (400×400) e Portal Principal (743×423) como prévias e saídas do lote. As caixas foram validadas em: Campi 8% / 70% / 65% / 25%; Principal 38% / 75% / 57% / 28%, com limite visual de fonte entre 10 e 20px.
- **Metadados compactos**: Editoria e Subtítulo foram reduzidos na prévia e na exportação, incluindo seus botões contextuais, para preservar a hierarquia da manchete.
- **Botões contextuais PS27**: Os controles de Editoria e Subtítulo passaram a reutilizar a mesma escala, ícones, espaçamento e estados de interação do Manchete Express.
- **Escala dos controles na arte**: Apenas os botões flutuantes de Editoria e Subtítulo usam `font-size: 60%`, relativo à caixa de texto. Os demais controles do módulo permanecem inalterados.
- **Rótulos de slogan**: Corrigida a associação visual das opções: a camada `slogan-ps27` é Pink e a camada `slogan-ps27-pink` é Verde.
- **Rótulos de BG para texto**: Corrigida a associação entre as camadas Verde e Amarelo; Vermelho permanece inalterado.
- **Fidelidade prévia/exportação**: A tipografia do PS27 agora é escalada pela largura nativa de cada formato tanto no canvas quanto na prévia (`cqw`). Isso elimina a divergência causada pelo antigo tamanho em `vw`, especialmente no Story e nos portais.
- **Metadados na prévia**: Editoria e Subtítulo usam tamanho e entrelinha explícitos em relação à manchete, com medidas legíveis e iguais na prévia e no canvas: 20/48 para editoria e 16/48 para subtítulo.
- **Orientações editáveis**: As novas artes passam a iniciar com “Digite o seu texto aqui”, “Editoria” e “Seu subtítulo aqui”. Cada orientação é limpa no primeiro clique para iniciar a edição; a editoria foi ampliada para 26/48 da manchete no canvas, com espaço vertical correspondente.
- **Portal Principal**: A manchete usa uma escala própria menor (36/48) na prévia e na exportação, preservando espaço para textos mais longos. O fim da página ganhou respiro extra para deixar o card completo visível acima da barra fixa.
- **Quebras manuais PS27**: A exportação agora preserva as quebras de linha digitadas na caixa de texto, inclusive no Portal Principal; elas não são mais convertidas em espaços durante a composição no canvas.
- **Instagram Story**: A manchete e a editoria usam uma escala maior exclusivamente no Story (54px e 30px na arte de 1080px), aplicada igualmente à prévia e à exportação.
- **Prévia e data/hora**: A prévia passou a manter as quebras manuais ao reabrir ou sincronizar um texto. Data e hora ganharam tamanho maior e peso 900 em todos os cards e arquivos exportados.
- **Subtítulo PS27**: O subtítulo foi ampliado de 16px para 22px na base de 1080px (18px no Portal Principal) e usa razões correspondentes na prévia, mantendo equivalência visual com a exportação.
- **Subtítulo em redes sociais**: Instagram Post usa 26px e Story usa 30px para o subtítulo na base de 1080px; Portal dos Campi e Portal Principal preservam suas escalas anteriores para não comprometer o espaço disponível.
- **Subtítulo do Story**: O Instagram Story usa 30px e entrelinha 1,15 no subtítulo. A mesma quebra, espaçamento e medida são calculados no canvas de exportação.
- **Formatação rica PS27**: Manchetes e subtítulos do Processo Seletivo 2027 passaram a aceitar a mesma sintaxe do Manchete Express: `**negrito**`, `*itálico*` e `$$destaque verde$$`. Ao sair do campo, a prévia e o canvas renderizam o resultado; ao clicar novamente, o campo volta à sintaxe para edição. A página inicial exibe a orientação sem remover os recursos existentes.
- **Rascunho PS27 persistente**: Textos, formatos, camadas escolhidas, metadados e data/hora do Processo Seletivo 2027 passam a ser salvos no `localStorage` do mesmo rascunho do Manchete Express e são restaurados ao recarregar a página.
- **Sincronização de metadados PS27**: Editoria e Subtítulo agora reutilizam o comportamento de sincronização do Manchete Express: ao editar um formato, as demais prévias e os canvases de exportação são atualizados imediatamente.
- **Independência por formato**: Ao desligar “Sincronizado”, cada arte passa a manter sua própria manchete, editoria, subtítulo e visibilidade desses dois metadados. Ao religar, o conteúdo do formato em edição é copiado para os demais, no mesmo padrão do Manchete Express.
- **Painel PS27**: Os controles foram redistribuídos em uma grade com espaçamento ampliado; a sincronização passou a ocupar uma faixa independente abaixo das opções.
- **Respiro entre campos**: Slogan, BG para texto, Personagens e Data/hora receberam espaçamento vertical explícito de 2,5rem entre as linhas da grade, evitando que títulos e opções se encostem.
- **Consistência do painel**: O texto auxiliar de Data/hora foi igualado ao tamanho do texto de sincronização; o botão Adicionar/Ativado agora usa o mesmo tamanho e padding do botão Sincronizado. A faixa de sincronização recebeu margem e padding explícitos em relação à sua linha divisória.
- **Sincronização limpa**: Ao ativar a sincronização entre formatos, Editoria e Subtítulo são limpos e ocultados junto com a atualização da manchete, evitando que metadados anteriores sejam reaproveitados.
- **Data/hora e brilho**: Ao ativar data/hora, o elemento decorativo `brilho 1` é ocultado. Os números da data/hora foram ampliados e aproximados verticalmente para uma leitura mais compacta.

### Decisões
- **Portais no mesmo fluxo**: Portal dos Campi e Portal Principal integram a mesma tela e o mesmo lote de exportação do Post e do Story, para permitir a produção completa em uma única etapa.
- **Sem Histórico na interface**: O atalho de Histórico foi retirado da tela inicial e da barra do editor porque o fluxo não está funcional. Nenhum dado armazenado foi apagado.
- **SVGs rasterizados**: As camadas do arquivo de origem são imagens embutidas; por isso o módulo compõe PNG/JPG no canvas em vez de prometer edição vetorial das camadas.

### Manutenção
- `scripts/extract-ps27-assets.mjs` é o extrator reproduzível das camadas dos SVGs PS27.
- A ordem do novo script do módulo em `index.html` é validada por `scripts/check.mjs`.
- **Confiabilidade de download**: O link temporário de exportação permanece no documento por um segundo antes de liberar a URL do arquivo. Isso evita que navegadores como Firefox cancelem o download antes de iniciá-lo.
- **Exportação PS27**: As camadas são pré-carregadas ao entrar no módulo. O lote usa URLs de dados geradas de modo síncrono no clique, permitindo que Firefox inicie os quatro downloads (Post, Story e os dois portais) sem perder a autorização do gesto do usuário.
- **Origem segura para exportação**: Assim como as imagens carregadas pelo Manchete Express, as camadas do PS27 são fornecidas ao canvas como URLs de dados. Isso preserva a exportação ao abrir `index.html` diretamente no Firefox, sem exigir servidor local. `npm run start` continua disponível apenas para desenvolvimento.
- **Peso dos arquivos PS27**: JPG passou a usar qualidade 78% e é apresentado como a opção recomendada. PNG foi preservado como alternativa sem perda, com aviso explícito de que terá arquivos maiores.
- **Nitidez dos portais**: Portal dos Campi e Portal Principal usam JPG em 92%, equivalente ao padrão de qualidade do Manchete Express, e a composição passou a solicitar suavização de alta qualidade no canvas. Post e Story preservam o JPG compacto de 78%.
- **Prévia em alta densidade**: As prévias do PS27 são desenhadas com densidade mínima de 2× antes de serem exibidas no card. Isso evita ampliar um canvas de 400 px no Portal dos Campi e melhora a nitidez visual.
- **Diagnóstico de nitidez nos portais**: Slogan e logo foram comparados entre os quatro SVGs; cada camada é byte a byte idêntica (slogan PNG 1397×742 e logo PNG 851×848). Portanto, Post e Story não fornecem uma fonte de maior resolução para os portais; a correção real depende de uma exportação nova dessas camadas no Figma.
- **SVGs de portal em 2×:** As novas pranchas dos portais têm 800×800 e 1486×846. O módulo continua exportando nos tamanhos finais 400×400 e 743×423, usando metade das coordenadas da prancha 2×. A reexportação não alterou os PNGs internos de slogan e logo, portanto não mudou a nitidez dessas camadas.
- **Atualização de fontes PS27:** As camadas foram extraídas novamente do SVG atualizado de Portal Principal e o pacote local de assets embutidos foi regenerado, para que a prévia e a exportação utilizem exatamente a última versão fornecida.
- **PNGs de logo e slogan:** As camadas foram substituídas pelos PNGs transparentes fornecidos em `svgs - processo seletivo/PNGS/`, preservando as coordenadas de cada formato. O seletor agora identifica corretamente as novas imagens como Verde e Pink.
- **Escalas atualizadas de slogan e logo:** As medidas dos SVGs de portal em 2× passaram a alimentar as coordenadas lógicas do módulo: logo e slogan usam metade dos valores da nova prancha, preservando os arquivos finais em 400×400 e 743×423 e refletindo os tamanhos ajustados no Figma.
- **Paridade entre prévia e exportação:** A prévia PS27 agora usa o mesmo canvas completo da exportação — incluindo manchete, editoria e subtítulo. A camada HTML fica transparente fora do foco e serve somente para edição direta, eliminando as diferenças anteriores de composição entre tela e arquivo.
- **Ajuste de composição do Portal dos Campi:** A caixa de editoria, manchete e subtítulo foi deslocada 10 px para baixo (de 70% para 72,5% da altura), evitando a sobreposição com o slogan reposicionado no Figma.

### Pendências conhecidas
- **Nitidez de logo e slogan nos portais:** As tentativas de reaplicar as camadas e de igualar prévia/exportação não resolveram a percepção de baixa nitidez. A composição preserva as posições, mas depende de novas camadas-fonte. Para a próxima tentativa, substituir por PNGs transparentes em resolução maior do logo IFMG e das duas variações de slogan, mantendo as mesmas coordenadas no canvas.

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
