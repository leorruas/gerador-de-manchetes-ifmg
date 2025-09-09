# Regras de Negócio

## 1. Usuários

-   **Jornalistas:** Criam e exportam as imagens.
-   **Designers:** Mantêm os templates e a identidade visual (através da manutenção deste app).

## 2. Formatos de Saída

1.  **Instagram Post:** 1080 × 1350
2.  **Instagram Stories:** 1080 × 1920
3.  **Portal dos Campi:** 400 × 400
4.  **Portal Principal:** 743 × 423

## 3. Conteúdo por Formato

### Instagram (Post e Stories)

-   **Logo IFMG Circular:**
    -   Posicionado à esquerda, dentro da caixa de texto.
    -   Tamanho fixo de 120x120 pixels.
    -   A altura da caixa de texto se ajusta para conter o logo.
-   **Caixa de Texto (Manchete):**
    -   **Visibilidade:** A caixa de texto é exibida imediatamente após o carregamento da imagem de fundo.
    -   Largura fixa de 946 px, alinhada ao centro da imagem.
    -   Altura dinâmica, baseada na quantidade de texto e na presença do logo.
    -   Possibilidade de ajuste vertical (drag and drop) dentro da área segura da imagem.
    -   **Fonte:** Fonte Archivo, 50px, Bold, cor branca.
    -   **Efeito de Fundo:** Efeito de "glass" (vidro fosco) com cor de fundo `rgba(0, 0, 0, 0.5)` e bordas arredondadas (24px).
-   **Padding Interno (Caixa de Texto):**
    -   40px em todos os lados.

### Portais (dos Campi e Principal)

-   Apenas a imagem de fundo, reenquadrada para o formato específico.
-   Não possuem caixa de texto nem logo.

## 4. Regras de Entrada

-   **Upload:** O usuário deve fazer o upload de uma imagem base nos formatos JPG, PNG ou WebP, seja clicando na área de upload ou arrastando e soltando o arquivo sobre ela.
-   **Reenquadramento:** A aplicação permite reenquadrar a imagem de fundo individualmente para cada formato. Um modal de edição, acessado por um ícone na pré-visualização, oferece controles de **zoom (slider)** e **posição (drag-and-drop)**.
-   **Edição de Texto:** Nos formatos de Instagram, o usuário edita a manchete diretamente no preview da imagem.

## 5. Exportação

-   **Modo:** Exportação em lote de todos os formatos de uma vez.
-   **Seleção de Formato:** Um modal solicita ao usuário que escolha entre PNG ou JPG para a exportação em lote.
-   **Nomenclatura de Arquivo:** Os arquivos são nomeados automaticamente seguindo o padrão `AAAA-MM-DD_ifmg_slug_formato.ext`, onde o `slug` é fornecido pelo usuário no momento da exportação.
    -   **Exemplo:** `2025-09-09_ifmg-semana-calouros_post-1080x1350.png`