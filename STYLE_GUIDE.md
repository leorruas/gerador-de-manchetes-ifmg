# Guia de Estilo

## 1. Filosofia de Design

Interface minimalista, dark mode, focada na tarefa. O objetivo é que o usuário chegue, faça o upload, edite o texto e exporte — sem distrações. Controles contextuais aparecem quando necessários (ex: barra de crop in-place, sync de manchete ao hover).

---

## 2. Paleta de Cores

| Papel | Valor | Nota |
|-------|-------|------|
| Fundo principal | `#000000` | Preto puro |
| Superfícies (cards, modais) | `#09090b` (zinc-950) | Quase preto |
| Bordas e divisórias | `#27272a` (zinc-800) | Sutil |
| Texto principal | `#FFFFFF` | Branco |
| Texto secundário | `#a1a1aa` (zinc-400) | Placeholders, labels |
| Texto terciário | `#71717a` (zinc-500) | Info discreta |
| Ação principal | `#FBBF24` (amber-400) | Botões de confirmação, export |
| Ação secundária | `#3f3f46` (zinc-700) | Botões alternativos |
| Cancelamento | `#EF4444` (red-500) | Texto de cancelar |
| Destaque de rich text | `#22c55e` (green-500) | Highlight `$$texto$$` |

---

## 3. Tipografia

-   **Fonte da interface:** `Archivo` (Google Fonts, 400 e 700). Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`.
-   **Fonte nas imagens exportadas:** `Archivo` (carregada via `document.fonts.load` antes do render no canvas).

### Tamanhos de texto nas imagens (base 1080px, escalam proporcionalmente via `safeScale = format.width / 1080`):

| Elemento | Tamanho base | Peso |
|----------|-------------|------|
| Manchete (Glass Box) | `50px` | Regular (bold via rich text) |
| Manchete (Gradient/Hero) | `65px` | Bold |
| Manchete (Quote) | `45px` | Italic Bold |
| Manchete (Infographic) | `35px` | Bold + maiúsculas |
| Editoria/Eyebrow (Glass Box) | `18px` | Regular + uppercase + letter-spacing |
| Editoria/Eyebrow (Gradient) | `20px` | Bold + uppercase |
| Número destaque (Infographic) | `140px` | Bold |
| Subtítulo (Glass Box) | `28px` | Regular |
| Subtítulo (Gradient) | `32px` | Regular |

---

## 4. Componentes

### Botões
-   **Primários:** `bg-amber-400 text-black font-bold rounded-lg` — confirmação, exportação.
-   **Secundários:** `bg-zinc-800 text-white font-semibold rounded-lg border border-zinc-700`.
-   **Arredondados (pills):** `rounded-full` — usado em controles de crop e seleção de template.
-   **Estados de foco:** `focus:outline-none focus:ring-2 focus:ring-amber-500` (ações primárias) ou `focus:ring-zinc-400` (ações secundárias).
-   **Hover:** `hover:bg-amber-500` (primário), `hover:bg-zinc-700` (secundário).

### Modais
-   Overlay: `bg-black/75 fixed inset-0 z-50`.
-   Container: `bg-black border border-zinc-800 rounded-xl shadow-lg`.
-   Fechamento via Esc ou botão de cancelar.

### Barra de Controles (footer)
-   Fixa na base: `fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-zinc-800`.
-   Contém: Histórico, Nova Imagem, Exportar Todos.

### Crop In-Place
-   Barra de controles aparece sobre o preview: `absolute bottom-4 ... bg-black/60 backdrop-blur-sm rounded-3xl`.
-   Overlay escuro ao entrar no modo crop.
-   Cursor `cursor-grab` na imagem, `cursor-grabbing` durante o arrasto.

### Barra de Templates
-   Scroll horizontal em mobile (`overflow-x-auto`, `scroll-snap-type: x mandatory`).
-   Botão ativo: `bg-amber-400 text-black border-amber-400`.
-   Botão inativo: `bg-zinc-800 text-zinc-300 border-zinc-700`.
-   Templates Glass Box têm um dot colorido à esquerda representando a cor da caixa.

### Feedback (Toast)
-   Aparece no topo, centralizado, com `backdrop-blur-sm`.
-   **Sucesso:** `bg-emerald-950/90 border-emerald-700/60 text-emerald-100`.
-   **Erro:** `bg-red-950/90 border-red-700/60 text-red-100`.
-   **Info:** `bg-zinc-900/90 border-zinc-700 text-zinc-100`.
-   Duração: 4 segundos.

### Zonas Seguras do Stories
-   Overlay semitransparente nas áreas superior (10%) e inferior (20%).
-   Labels com texto borrado (`blur-[0.5px]`) para indicar visualmente sem distrair.

---

## 5. Responsividade

-   **Mobile-first** com breakpoints `sm:` (≥640px) e `lg:` (≥1024px).
-   Tela inicial: 1 coluna em mobile, 2 colunas em desktop (`lg:grid-cols-2`).
-   Barra de templates: scroll horizontal snap em mobile, wrap em desktop.
-   Controles de crop: coluna única em mobile, linha em `sm:`.
-   Barra de ações: coluna em mobile, linha em `sm:`.

---

## 6. Animações e Transições

-   Transições de cor e opacidade: `transition-colors`, `transition-opacity`, `transition-all duration-300`.
-   Hover em cards (painel "Seu Impacto"): `hover:scale-105`.
-   Hover em botões de ação sync: `hover:scale-110`, `active:scale-95`.
-   Botão de upload: escala e borda sólida ao arrastar arquivo sobre.