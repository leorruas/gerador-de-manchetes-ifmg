# MancheteExpress

## 1. Sobre o Projeto

Uma aplicação para automatizar a criação de imagens institucionais padronizadas para redes sociais e portais do IFMG, permitindo que jornalistas gerem peças visuais de forma rápida e consistente, sem depender da equipe de design.

## 2. Funcionalidades Principais

-   **Upload de Imagem Flexível:** Permite o envio de imagens nos formatos JPG, PNG e WebP, tanto clicando para selecionar quanto arrastando e soltando o arquivo (drag-and-drop).
-   **Múltiplos Formatos:** Gera automaticamente previews para 4 formatos de saída diferentes: Instagram Post, Instagram Stories, Portal dos Campi e Portal Principal.
-   **Manchete Visível Imediatamente:** A manchete padrão aparece na imagem assim que ela é carregada, pronta para ser editada pelo usuário.
-   **Logo Institucional:** Inclui o logo circular do IFMG automaticamente nas imagens de Instagram.
-   **Posicionamento Vertical:** A caixa de texto pode ser arrastada verticalmente (drag-and-drop) de forma independente para cada formato.
-   **Reenquadramento de Imagem (Crop):**
    -   Cada formato de imagem possui uma ferramenta de reenquadramento individual, acessada por um ícone de "alvo" (viewfinder).
    -   Um modal dedicado permite reposicionar a imagem de fundo arrastando-a e aplicar zoom com um controle deslizante.
-   **Exportação em Lote:** Exporta todas as imagens de uma vez, com um modal para escolher o formato de arquivo (PNG ou JPG).
-   **Nomenclatura Automática:** Os arquivos são nomeados automaticamente seguindo um padrão institucional, com um slug (nome de arquivo) personalizável pelo usuário.

## 3. Como Usar

1.  **Envie uma imagem:** Arraste e solte um arquivo na área indicada ou clique para selecionar um do seu computador.
2.  **Ajuste os formatos:** Reenquadre a imagem para cada formato usando o ícone de alvo (viewfinder).
3.  **Edite a manchete:** Clique no texto sobre a imagem para editar a manchete (para formatos de Instagram).
4.  **Ajuste a posição:** Clique e arraste a caixa de texto verticalmente para a posição ideal.
5.  **Exporte:** Clique em "Exportar Todos", defina um slug (nome de arquivo) e escolha o formato para baixar as imagens.

---

## 4. Regras de Negócio

### 4.1. Usuários

-   **Jornalistas:** Criam e exportam as imagens.
-   **Designers:** Mantêm os templates e a identidade visual (através da manutenção deste app).

### 4.2. Formatos de Saída

1.  **Instagram Post:** 1080 × 1350
2.  **Instagram Stories:** 1080 × 1920
3.  **Portal dos Campi:** 400 × 400
4.  **Portal Principal:** 743 × 423

### 4.3. Conteúdo por Formato

#### Instagram (Post e Stories)

-   **Logo IFMG Circular:**
    -   Posicionado à esquerda, dentro da caixa de texto.
    -   Tamanho fixo de 100x100 pixels.
-   **Caixa de Texto (Manchete):**
    -   Largura fixa de 946 px, alinhada ao centro da imagem.
    -   Altura dinâmica, baseada na quantidade de texto e na presença do logo.
    -   Possibilidade de ajuste vertical (drag and drop) dentro da área segura da imagem.
    -   **Fonte:** Fonte de sistema (padrão iOS/macOS), 50px, Bold, cor branca.
    -   **Efeito de Fundo:** Efeito de "glass" (vidro fosco) com cor de fundo `rgba(0, 0, 0, 0.5)` e bordas arredondadas (24px).
-   **Padding Interno (Caixa de Texto):**
    -   60px em todos os lados.

#### Portais (dos Campi e Principal)

-   Apenas a imagem de fundo, reenquadrada para o formato específico.
-   Não possuem caixa de texto nem logo.

### 4.4. Regras de Entrada

-   **Upload:** O usuário deve fazer o upload de uma imagem base nos formatos JPG, PNG ou WebP, seja clicando na área de upload ou arrastando e soltando o arquivo sobre ela.
-   **Reenquadramento:** A aplicação permite reenquadrar a imagem de fundo individualmente para cada formato. Um modal de edição, acessado por um ícone na pré-visualização, oferece controles de **zoom (slider)** e **posição (drag-and-drop)**.
-   **Edição de Texto:** Nos formatos de Instagram, o usuário edita a manchete diretamente no preview da imagem.

### 4.5. Exportação

-   **Modo:** Exportação em lote de todos os formatos de uma vez.
-   **Seleção de Formato:** Um modal solicita ao usuário que escolha entre PNG ou JPG para a exportação em lote.
-   **Nomenclatura de Arquivo:** Os arquivos são nomeados automaticamente seguindo o padrão `AAAA-MM-DD_ifmg_slug_formato.ext`, onde o `slug` é fornecido pelo usuário no momento da exportação.
    -   **Exemplo:** `2025-09-09_ifmg-semana-calouros_post-1080x1350.png`

---

## 5. Guia de Estilo

### 5.1. Filosofia de Design

A interface segue uma estética minimalista, limpa e moderna, com um tema escuro (dark mode) para focar o conteúdo. O objetivo é centrar na tarefa do usuário, com controles intuitivos e feedback visual claro.

### 5.2. Paleta de Cores

-   **Fundo Principal:** Preto (`#000000` ou `bg-black`)
-   **Superfícies (Cards, Modais):** Preto (`#000000` ou `bg-black`), com bordas Zinco Escuro (`#27272a` ou `border-zinc-800`) para definição.
-   **Bordas e Divisórias:** Zinco Escuro (`#27272a` ou `border-zinc-800`)
-   **Texto Principal:** Branco Quase Puro (`#F9FAFB` ou `text-gray-50`)
-   **Texto Secundário/Placeholder:** Zinco Claro (`#a1a1aa` ou `text-zinc-400`)
-   **Ação Principal (Botões, Links):** Amarelo Vibrante (`#FBBF24` ou `bg-amber-400`)
-   **Ação Secundária:** Zinco Médio (`#3f3f46` ou `bg-zinc-700`)
-   **Ação de Cancelamento:** Vermelho (`#EF4444` ou `text-red-500`)

### 5.3. Tipografia

-   **Fonte Principal:** Pilha de fontes de sistema, priorizando a fonte padrão de plataformas Apple (`-apple-system`, `BlinkMacSystemFont`, "Segoe UI", `Roboto`).
-   **Manchete na Imagem (Exportada):** `50px`, `Bold`, cor Branca.

### 5.4. Componentes

-   **Botões:** Cantos arredondados (`rounded-lg`).
-   **Modais:** Cantos bem arredondados (`rounded-xl`), sobrepondo o conteúdo com um fundo semi-transparente.
-   **Layout:**
    -   **Tela de Boas-Vindas:** Layout responsivo, com duas colunas em telas maiores (upload à esquerda, instruções à direita) e uma única coluna centralizada em dispositivos móveis.
    -   **Tela Principal:** Layout de coluna única, centralizado, com controles em uma barra inferior fixa.

---

## 6. Notas para o Desenvolvedor (Lembrete Permanente)

-   **Documentar Sempre:** Lembre-se de documentar *todas* as alterações de forma clara e completa no `README.md`, `BUSINESS_RULES.md` e `STYLE_GUIDE.md`. A documentação é tão crucial quanto o código.
-   **Não Remova Este Lembrete:** Esta seção deve permanecer no `README.md` como um lembrete constante da importância da documentação.
-   **Referência do Logo:** O arquivo `ifmg.svg` é uma referência visual e de código para o logo circular do IFMG. Utilize-o conforme necessário para garantir a consistência visual.

---

## 7. Deploy no GitHub Pages

Este projeto foi configurado para ser publicado como um site estático, ideal para serviços como o GitHub Pages.

### Passo a Passo para Publicação

1.  **Acesse as Configurações:** No seu repositório do GitHub, vá para a aba "Settings".
2.  **Seção "Pages":** No menu lateral, clique em "Pages".
3.  **Fonte de Publicação:**
    -   Em "Build and deployment", na opção "Source", selecione "Deploy from a branch".
    -   Em "Branch", escolha a branch que contém o código do site (geralmente `main` ou `master`).
    -   Deixe a pasta como `/ (root)`.
4.  **Salve:** Clique em "Save".

Após alguns minutos, seu site estará no ar! O link será exibido na mesma página, no formato: `https://<seu-usuario>.github.io/<nome-do-repositorio>/`.

**Nota Técnica:** Para que o código (TypeScript/JSX) funcione diretamente no navegador sem um passo de compilação prévia, o projeto utiliza o **Babel Standalone**. Ele é carregado no `index.html` e transpila o código em tempo real. O script principal foi alterado para `type="text/babel"` para que o Babel possa processá-lo corretamente. Esta abordagem simplifica o deploy em ambientes de hospedagem estática como o GitHub Pages.