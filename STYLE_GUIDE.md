# Guia de Estilo

## 1. Filosofia de Design

A interface segue uma estética minimalista, limpa e moderna, com um tema escuro (dark mode) para focar o conteúdo. O objetivo é centrar na tarefa do usuário, com controles intuitivos e feedback visual claro.

## 2. Paleta de Cores

-   **Fundo Principal:** Preto (`#000000` ou `bg-black`)
-   **Superfícies (Cards, Modais):** Preto (`#000000` ou `bg-black`), com bordas Zinco Escuro (`#27272a` ou `border-zinc-800`) para definição.
-   **Bordas e Divisórias:** Zinco Escuro (`#27272a` ou `border-zinc-800`)
-   **Texto Principal:** Branco Quase Puro (`#F9FAFB` ou `text-gray-50`)
-   **Texto Secundário/Placeholder:** Zinco Claro (`#a1a1aa` ou `text-zinc-400`)
-   **Ação Principal (Botões, Links):** Amarelo Vibrante (`#FBBF24` ou `bg-amber-400`)
-   **Ação Secundária:** Zinco Médio (`#3f3f46` ou `bg-zinc-700`)
-   **Ação de Cancelamento:** Vermelho (`#EF4444` ou `text-red-500`)

## 3. Tipografia

-   **Fonte Principal:** Pilha de fontes de sistema, priorizando a fonte padrão de plataformas Apple (`-apple-system`, `BlinkMacSystemFont`, "Segoe UI", `Roboto`).
-   **Manchete na Imagem (Exportada):** `50px`, `Bold`, cor Branca.

## 4. Componentes

-   **Botões:** Cantos arredondados (`rounded-lg`).
-   **Modais:** Cantos bem arredondados (`rounded-xl`), sobrepondo o conteúdo com um fundo semi-transparente.
-   **Áreas de Upload (Dropzones):** Utilizam bordas tracejadas que se tornam sólidas e na cor de ação principal (`#FBBF24`) durante o evento de arrastar (drag-over) para fornecer feedback visual claro.
-   **Layout:**
    -   **Tela de Boas-Vindas:** Responsiva, com layout de duas colunas em desktops (upload à esquerda, instruções à direita) e uma única coluna em dispositivos móveis.
    -   **Tela Principal:** Layout de coluna única, centralizado, com controles em uma barra inferior fixa.
-   **Estados de Foco:** Elementos interativos usam um anel de foco amarelo (`focus:ring-amber-500`) para consistência e acessibilidade.

## 5. Ações e Feedback

-   **Ações Primárias:** Amarelo Vibrante (`#FBBF24`). Usado para confirmar ações principais como exportar ou salvar.
-   **Ações Secundárias:** Zinco Médio (`#3f3f46`). Usado para ações alternativas.
-   **Ações de Cancelamento:** Texto Vermelho (`#EF4444`). Usado para cancelar operações em modais, para indicar uma ação que desfaz um progresso.