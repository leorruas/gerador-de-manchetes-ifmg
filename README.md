> [!NOTE]
> **Lembretes para o Assistente:**
> - Não alterar o conteúdo do SVG do logo (internalizado em `constants.js`) sem instrução explícita.
> - Lembrar de sempre documentar todas as alterações em todos os arquivos relevantes para evitar inconsistências.
> - Não alterar a UX/UI do app, a não ser sob requisição
> - Não deletar esses lembretes aqui.

# MancheteExpress

## 1. Sobre o Projeto

Uma aplicação para automatizar a criação de imagens institucionais padronizadas para redes sociais e portais do IFMG, permitindo que jornalistas gerem peças visuais de forma rápida e consistente, sem depender da equipe de design.

## 2. Funcionalidades Principais

-   **Upload de Imagem Flexível:** Permite o envio de imagens nos formatos JPG, PNG e WebP, tanto clicando para selecionar quanto arrastando e soltando o arquivo (drag-and-drop).
-   **Múltiplos Formatos:** Gera automaticamente previews para 4 formatos de saída diferentes: Instagram Post, Instagram Stories, Portal dos Campi e Portal Principal.
-   **Edição de Manchete:** A manchete padrão aparece na imagem assim que ela é carregada, pronta para ser editada pelo usuário.
-   **Logo Institucional:** Inclui o logo circular do IFMG automaticamente nas imagens de Instagram.
-   **Posicionamento Vertical:** A caixa de texto pode ser arrastada verticalmente (drag-and-drop) de forma independente para cada formato.
-   **Reenquadramento de Imagem (Crop):**
    -   Cada formato de imagem possui uma ferramenta de reenquadramento individual.
    -   Um modal dedicado permite reposicionar a imagem de fundo arrastando-a e aplicar zoom com um controle deslizante.
-   **Exportação em Lote:** Exporta todas as imagens de uma vez, com um modal para escolher o formato de arquivo (PNG ou JPG).
-   **Nomenclatura Automática:** Os arquivos são nomeados automaticamente seguindo um padrão institucional, com um slug (nome de arquivo) personalizável pelo usuário.

## 3. Como Usar

1.  **Envie uma imagem:** Arraste e solte um arquivo na área indicada ou clique para selecionar um do seu computador.
2.  **Ajuste os formatos:** Reenquadre a imagem para cada formato usando o ícone de alvo.
3.  **Edite a manchete:** Clique no texto sobre a imagem para editar a manchete (para formatos de Instagram).
4.  **Ajuste a posição:** Clique e arraste a caixa de texto verticalmente para a posição ideal.
5.  **Exporte:** Clique em "Exportar Todos", defina um slug (nome de arquivo) e escolha o formato para baixar as imagens.

---

## 4. Estrutura Técnica

Este projeto foi construído com **HTML, CSS (Tailwind via CDN) e JavaScript puro (Vanilla JS)** para garantir máxima simplicidade, performance e compatibilidade com qualquer serviço de hospedagem de sites estáticos, como o GitHub Pages.

-   **`index.html`**: A estrutura base da página.
-   **`index.js`**: O arquivo principal que controla todo o estado e a lógica da aplicação, renderizando o HTML dinamicamente.
-   **`constants.js`**: Armazena dados estáticos como as configurações de formato e os SVGs dos logos.
-   **`services/canvasExport.js`**: Contém a lógica para desenhar as imagens no canvas e iniciar o download.

Essa abordagem elimina a necessidade de qualquer processo de compilação (build), transpilação ou dependências complexas, tornando o projeto extremamente leve e fácil de manter.

---

## 5. Deploy no GitHub Pages

Este projeto está pronto para ser publicado diretamente no GitHub Pages.

1.  **Acesse as Configurações:** No seu repositório do GitHub, vá para "Settings" > "Pages".
2.  **Fonte de Publicação:**
    -   Selecione "Deploy from a branch".
    -   Escolha a branch `main` (ou `master`) e a pasta `/(root)`.
3.  **Salve:** Clique em "Save". O site estará no ar em alguns minutos.