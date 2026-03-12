# Ideias de Evolução - MancheteExpress

Este documento reúne diversas possibilidades de evolução para o projeto **MancheteExpress**, divididas estruturalmente em frentes de melhoria para guiar futuros ciclos de desenvolvimento.

## 1. Novas Funcionalidades e Design

*   **[FEITO] Melhorias na Interface de Edição:**
    *   *[FEITO] Subtítulo e Editoria:* Em vez de campos fixos, poderiam ser dois botões estilo "Adicionar Subtítulo" e "Adicionar Editoria" localizados logo abaixo da imagem, ativando os campos apenas quando necessário para limpar a interface inicial.
    *   *[FEITO] Seleção de Templates:* Substituir o atual menu *dropdown* por uma barra horizontal de botões em formato *pill* (pílulas) no topo da imagem, permitindo trocar de template com apenas um clique e mantendo as opções sempre visíveis.
*   **[FEITO] Múltiplos Templates/Layouts:** Em vez de restringir o texto a uma caixa translúcida, oferecer variações visuais:
    *   *[FEITO] Gradient Overlay:* A imagem recebe um degradê escuro na base, com o texto livre por cima.
    *   *[FEITO] Aspas / Citações:* Layout desenhado para falas (ex: diretor, aluno destaque), com a foto da pessoa ao fundo e o texto em destaque (itálico/aspas).
    *   *[FEITO] Números / Infográficos:* Foco em estatísticas rápidas ("Mais de 2.000 vagas", "1º Lugar").
*   **Gerador de Carrossel:** Para o formato *Instagram Post*, permitir a adição de múltiplas manchetes e fatiar a imagem de fundo ou manter a identidade visual ao exportar múltiplas páginas (1, 2, 3...) simultaneamente.
*   **Filtros de Imagem Embutidos:** Ajustes de brilho, contraste e saturação. Seria interessante um filtro "Duotone" usando as cores institucionais (verde e vermelho/laranja do IFMG) para harmonizar fotos de qualidade variável.
*   **[FEITO] Safe Zones (Zonas Seguras):** Mostrar guias translúcidas no preview do Instagram indicando onde ficam botões nativos da rede (likes, comentários, perfil), evitando que o texto fique coberto.
*   **[FEITO] Formatação Rica Estendida:** Além do `**negrito**`, adicionar suporte para `*itálico*` e um atalho (ex: `$$palavra$$`) para destacar o texto com a cor verde oficial da instituição.

## 2. Fluxo de Trabalho e Produtividade

*   **Banco de Imagens Local/Institucional:** Uma aba com fotos de arquivo do IFMG (reitoria, fachadas, texturas) para quando a matéria não tiver foto própria, eliminando a dependência de um upload local constante.
*   **[FEITO] Rascunhos e Histórico:** Expandir o uso do banco local (IndexedDB) para manter uma galeria das "Últimas artes criadas", facilitando o reuso de layouts ou a correção de erros de digitação em artes já exportadas.
*   **Integração com IA (Geração de Manchetes):** Inserir o link da notícia do portal (ou o texto bruto) e utilizar uma API (como OpenAI ou Gemini) para sugerir 3 opções de textos curtos e atrativos focados em redes sociais.

## 3. Evolução Técnica e Arquitetura

*   **Migração para Framework React/Vue + Vite:** Se o projeto ultrapassar a complexidade atual em Vanilla JS, a componentização ajudará a organizar o código (ex: separando modais, canvas e ferramentas de crop de forma modular).
*   **Tailwind com Build Step:** Substituir o uso de CDN por um setup completo do Tailwind. Isso reduz o tamanho do CSS, melhora o tempo de carregamento e permite gerenciar webfonts localmente.
*   **PWA (Progressive Web App):** A adição de um arquivo manifesto e um Service Worker permitiria que a aplicação fosse "instalada" e funcionasse de forma totalmente offline.

## 4. Acessibilidade e Usabilidade

*   **Atalhos de Teclado (Shortcuts):** Implementar atalhos como `Ctrl + S` para exportação, `Esc` para cancelar/fechar ferramentas, e uso de setas direcionais para movimentação pixel-a-pixel no reenquadramento e na posição da caixa de texto.
*   **Alerta de Contraste Automático:** Validação dinâmica dos pixels da imagem de fundo: se a região atrás da caixa de texto estiver muito clara, o sistema aumenta sutilmente a opacidade do fundo escuro (glass effect), garantindo contraste e legibilidade automáticos.

## 5. Identidade Visual e Personalização

*   **Gestão de "Brand Kits" (Kits de Marca por Campus):** Permitir que o usuário selecione qual campus está usando (ex: Reitoria, Bambuí, Formiga, etc.). O gerador ajustaria automaticamente os logos, brasões, paletas de cores secundárias ou assinaturas visuais específicas daquela unidade.
*   **Marca D'água / Selos (Stickers):** Uma biblioteca rápida de "selos" arrastáveis (ex: "Urgente", "Inscrições Abertas", "Nota Oficial", "Evento") que podem ser colados por cima da imagem para dar destaque extra sem poluir o texto principal.

## 6. Integração Externa e Dados

*   **Painel "Últimas do Portal" (via RSS/API):** O gerador poderia ler o feed RSS do portal de notícias do IFMG oficial e mostrar uma lista das últimas matérias publicadas. Com um clique, ele já preencheria a imagem, a manchete e a editoria automaticamente, deixando o usuário apenas com a tarefa de ajustar o enquadramento.
*   **Texto Alternativo (Alt Text) para Redes:** Aproveitar a estruturação das informações (título, editoria, template) e sugerir um texto descritivo (#PraCegoVer) pronto para ser copiado junto com a imagem da postagem, aumentando a acessibilidade.

## 7. Novos Formatos e Distribuição

*   **Thumbnails para YouTube:** Adicionar o formato 16:9 (capas de vídeo/banners de site) com templates dedicados, auxiliando a produção audiovisual da instituição.
*   **Exportação em Lote ("Pacotes"):** Exportar não apenas a imagem `.png`/`.jpg`, mas um arquivo `.zip` opcional que contenha a arte e um arquivo `.txt` contendo a sugestão de legenda e hashtags padrão.

## 8. Ferramentas para Equipes (Backend / Cloud)

*   **Link de Aproveitamento/Revisão:** Um botão "Compartilhar para Aprovação" que transforma a arte num link enviável para o revisor/jornalista aprovar o texto, minimizando refações pós-exportação.

## 9. Desempenho e Formatos Web

*   **Exportação Otimizada para Web (WebP):** Adicionar a opção de salvar em formato `.webp` com compressão ajustável. Isso é crucial para imagens que vão para o portal de notícias do IFMG, pois formatos modernos melhoram o SEO e o tempo de carregamento da página da instituição.
*   **[FEITO] Aviso de Tamanho de Arquivo:** Mostrar no momento da exportação uma estimativa do tamanho do arquivo gerado, alertando se a imagem final ficar muito "pesada" para os padrões da web.

## 10. Experiência do Usuário (UX) Avançada

*   **Modo "Super Expresso" (Drag & Drop + Automagical):** Permitir que o usuário apenas arraste e solte uma imagem diretamente na tela inicial e o sistema instantaneamente gere a manchete com o último template e as últimas configurações usadas (útil para quem faz várias artes sequenciais da mesma matéria/evento).
*   **[FEITO] Gamificação e Estatísticas Locais:** Um pequeno painel mostrando "Você gerou 15 artes este mês" ou "Você economizou X horas usando o MancheteExpress", incentivando o uso contínuo da ferramenta.

## 11. Expansão Mobile e Funcionalidades Extras

*   **[FEITO] Otimização Mobile-First Extrema:** Garantir que a ferramenta funcione de forma impecável na tela do celular, permitindo que o jornalista fotografe no evento, recorte a foto, coloque o texto e poste imediatamente, sem precisar de um notebook.
*   **Publicação/Agendamento Direto:** Integração futura com a API do Facebook/Meta ou ferramentas como o *Buffer*, permitindo que a arte gerada já pule a etapa de "salvar no computador" e vá direto para a fila de agendamento das redes sociais do campus.
