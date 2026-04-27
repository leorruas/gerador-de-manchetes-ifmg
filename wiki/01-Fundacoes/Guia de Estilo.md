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
- **Carrossel (História Completa)**: Utiliza a fonte **Montagu Slab** com variações de escala entre a capa (1.3x) e os slides internos (0.85x).

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

- **Tamanho**: `140px` (escala 1080px). No formato **Carrossel**, utiliza escala de **2.2x**.
- **Posição**: Alinhado à esquerda na Glass Box ou centralizado em Infográficos. No Carrossel, aparece apenas no slide final.

## 7. Controles de Preview e Edição

Para facilitar a edição direta sobre o canvas de preview, implementamos controles contextuais e utilitários globais.

### Controles de Utilidade (Canto Superior Direito)
Estes botões ficam fixos no topo do card de cada formato:
- **Olhinho (Imagem Pura)**: Permite ocultar todos os elementos de texto temporariamente para validar o enquadramento da foto.
- **Contraste (Contrast Boost)**: Exclusivo para o template **Glass Box**. Aumenta o desfoque para 12px e aplica um brilho de 0.6, garantindo legibilidade em fotos com áreas muito claras.
- **Ajustar/Preencher**: Alterna o modo de exibição da imagem (Contain vs Cover).
- **Layout de Fundo**: Botões para alternar entre **Degradê Inferior**, **Degradê Superior** e **Fundo Sólido** (comportamento individual por slide).
- **Navegação de Slides**: Botões circulares numerados acima do preview para alternar entre as fotos do carrossel.
- **Reordenar Slides**: Os botões de navegação do carrossel suportam **arrastar e soltar** (Drag & Drop), permitindo que o usuário altere a sequência narrativa das fotos após o upload.

### Controles de Contexto (Floating Buttons)
Os botões de ativação de campos opcionais flutuam diretamente sobre a caixa de texto:
- **Posicionamento**: Fixos 40px acima da `Headline Box`, acompanhando o movimento de arraste do texto.
- **Botões de Editoria e Subtítulo**:
  - Permitem ativar/desativar esses campos por formato.
  - **Ícones**: Utilizam ícones de `+` para adicionar e `-` para remover o campo.
  - **Exportação**: Estes botões são elementos de UI de edição e **não são incluídos** na imagem exportada.

### Comportamento de Edição
- **Edição Inline**: O clique nos textos ativa um `textarea` com as mesmas propriedades de estilo (fonte, tamanho, cor), permitindo edição direta sobre o preview.
- **Arraste Livre**: O usuário pode reposicionar a caixa de texto (Headline Box) livremente. Os botões de controle acompanham esse movimento para manter a ergonomia.

## 8. Marcações de Rich Text

Para dar dinamismo às manchetes, suportamos uma sintaxe simplificada de markdown processada em tempo real:

- **Negrito**: `**texto**` -> Exibe em Archivo Bold (700).
- **Itálico**: `*texto*` -> Exibe em itálico (usado em citações).
- **Destaque Amber**: `$$texto$$` -> Aplica a cor Amber (#FBBF24). Ideal para palavras-chave na manchete.

## 9. Sistema de Escala (Canvas vs Preview)

Toda a lógica visual é baseada em uma **Matriz de 1080px**. 
- **Escalabilidade**: Usamos uma função de escala para garantir que a proporção vista no navegador seja 100% idêntica à imagem exportada.
- **Unidades**: No código, as medidas são definidas em valores nominais (para 1080px) e convertidas dinamicamente usando a utilidade `px(scaleFactor, valor)`.

## 10. Feedback Visual e Estados

- **Hover em Cards**: Todos os previews possuem um `hover:border-zinc-700` e aumento suave de sombra para indicar interatividade.
- **Indicadores de Safe Zone**: No formato Story, exibimos overlays pontilhados (20% de opacidade) para alertar o usuário sobre áreas que serão cobertas pela interface do Instagram (perfil e caixa de resposta).
- **Esquema de Cores por Template**: 
  - **Notícia**: Preto translúcido.
  - **Evento**: Azul institucional.
  - **Comunicado**: Verde oficial.

