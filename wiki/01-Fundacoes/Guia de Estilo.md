# Guia de Estilo

A identidade visual do Manchete Express segue os padrões de comunicação do IFMG, com um toque moderno de UX.

## 1. Cores e Contraste

- **Amber (Destaque)**: `#FBBF24` (amber-400) - Usado para botões primários e marcações `$$destaque$$`.
- **Zinc (Interface)**: Tons de cinza do Tailwind (zinc-800, 900, 950) para UI dark mode.
- **Contrast Boost**: Funcionalidade que aplica um overlay extra de 40% preto e aumenta o blur para 24px na Glass Box.

## 2. Componentes de Interface: Botões

O sistema utiliza padrões claros para botões baseados no Tailwind CSS:

| Tipo | Estilo CSS | Uso |
| :--- | :--- | :--- |
| **Primário** | `bg-amber-400 text-black hover:bg-amber-500` | Ações principais (Exportar, Salvar). |
| **Secundário** | `bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700` | Ações de apoio (Histórico, Novo Post). |
| **Pill (Ativo)** | `bg-amber-400 text-black rounded-full` | Seleção de template ativa. |
| **Pill (Inativo)** | `bg-zinc-800 text-zinc-300 rounded-full hover:bg-zinc-700` | Seleção de template disponível. |
| **Ghost / Link** | `text-zinc-400 hover:text-amber-400` | Ações secundárias inline (Adicionar campo). |
| **Perigo** | `text-zinc-500 hover:text-red-400` | Ações destrutivas (Remover campo). |

**Padrão de Feedback**: Todos os botões devem ter `transition-colors` e `focus:ring-2` para acessibilidade.

## 3. Tipografia

- **Fonte Principal**: `Archivo` (Google Fonts).
- **Estilo**: 
  - Headlines: `700 (Bold)`.
  - Quotes: `Italic Bold`.
  - Subtítulos e Eyebrows: `400 (Regular)`.

## 4. Governança de Eventos (v2)

Para manter os templates HTML limpos e modulares, **não utilizamos handlers inline** (como `onclick=""`).

- **Atribuição**: Usamos atributos `data-action` nos elementos.
- **Delegatário**: O arquivo `app/events.js` captura todos os cliques/inputs e despacha para o handler correto.
- **Exemplo**: 
  ```html
  <button data-action="handleNewImage">Novo Post</button>
  ```

## 5. Componentes Visuais de Arte

### Glass Box (Caixa de Vidro)
- **Desfoque**: `12px` (padrão) ou `24px` (Contrast Boost).
- **Padding**: `40px` (escala 1080px).
- **Bordas**: Raio de `24px` (escala 1080px).

### Zonas Seguras (Safe Zones)
- Margem de 10% no topo e 20% na base no formato Story para evitar sobreposição da UI do Instagram.

## 6. Logo IFMG

- **Tamanho**: `140px` (escala 1080px).
- **Posição**: Alinhado à esquerda na Glass Box ou centralizado em Infográficos.

