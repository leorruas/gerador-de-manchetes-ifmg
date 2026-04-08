# Regras de Negócio

## 1. Usuários

-   **Jornalistas / Comunicadores:** Criam e exportam as artes para as redes sociais e portais do IFMG.
-   **Designers:** Mantêm os templates e a identidade visual (através da manutenção deste app).

---

## 2. Formatos de Saída

| # | Nome | Dimensões | Texto? | Logo? |
|---|------|-----------|--------|-------|
| 1 | Instagram Post | 1080 × 1350 | ✅ | ✅ |
| 2 | Instagram Stories | 1080 × 1920 | ✅ | ✅ |
| 3 | Portal dos Campi | 400 × 400 | ❌ | ❌ |
| 4 | Portal Principal | 768 × 497 | ❌ | ❌ |

---

## 3. Templates de Arte

A aplicação oferece **6 templates** selecionáveis, cada um com um layout e identidade visual própria:

| ID | Nome | Layout | Uso |
|----|------|--------|-----|
| `NEWS` | Notícia institucional | Glass Box (fundo preto) | Notícias em geral |
| `EVENT` | Evento | Glass Box (fundo azul) | Divulgação de agenda |
| `NOTICE` | Comunicado | Glass Box (fundo verde escuro) | Avisos oficiais |
| `HERO` | Capa / Destaque | Gradiente (sem caixa) | Fotos de impacto |
| `QUOTE` | Citação | Overlay escuro + aspas | Depoimentos e citações |
| `NUMBER` | Número Destaque | Infográfico centralizado | Rankings, estatísticas |

---

## 4. Conteúdo dos Templates com Texto

### Campos editáveis

-   **Editoria / Sobretítulo (eyebrow):** Campo opcional de texto curto em maiúsculas (ex: "IFMG", "Agenda IFMG"). Pode ser ocultado pelo usuário.
-   **Manchete:** Campo principal de texto. Suporta formatação rich text inline:
    -   `**texto**` → **negrito**
    -   `*texto*` → *itálico*
    -   `$$texto$$` → destaque em verde (`#22c55e`)
    -   Quebras de linha manuais com `Enter`
    -   Na exportação, o app rebalanceia as quebras automáticas para reduzir linhas finais muito curtas
    -   Cada formato tem sua própria manchete independente, mas há um botão para sincronizar o texto de um formato com os demais.
-   **Subtítulo:** Campo opcional de apoio textual.

### Layout Glass Box (NEWS, EVENT, NOTICE)

-   Caixa semi-transparente com efeito glass (backdrop-filter: blur).
-   Largura: **87.59%** da imagem (946px numa base de 1080px).
-   Padding interno: **40px** em escala proporcional.
-   Logo IFMG circular: **140px** (na base 1080px), posicionado à esquerda da caixa de texto.
-   Posição vertical ajustável via drag-and-drop dentro de uma área segura (5% de margem superior e inferior).

### Layout Gradient (HERO)

-   Sem caixa visível; gradiente escuro ascendente sobreposto à base da imagem.
-   Manchete em **negrito, 65px**, com sombra de texto.
-   Logo IFMG opcional (**100px**), posicionado acima do texto.

### Layout Quote (QUOTE)

-   Overlay escuro global (`rgba(0,0,0,0.6)`).
-   Ícone de aspas em amber.
-   Manchete em **itálico e negrito, 45px**, centralizada.
-   Divisória horizontal amber + nome do entrevistado (eyebrow) abaixo.

### Layout Infographic (NUMBER)

-   Overlay escuro (`rgba(0,0,0,0.4)`).
-   Número/destaque (eyebrow) em tamanho gigante (**140px**), centralizado.
-   Manchete em **negrito, maiúsculas, 35px**, centralizada.
-   Painel de fundo para o subtítulo.

---

## 5. Zonas Seguras (Safe Zones)

-   **Instagram Stories:** Indicadores visuais das zonas reservadas para o perfil (10% superior) e interação/stickers (20% inferior). O usuário deve evitar colocar texto nessas áreas.

---

## 6. Reenquadramento de Imagem (Crop)

-   O reenquadramento é feito **in-place**, diretamente sobre o preview de cada formato (sem modal separado).
-   Ao ativar o modo crop, a imagem fica arrastável, e uma barra de controles aparece na parte inferior do preview.
-   **Controles:** Slider de zoom (1x a 3x), botões `+` e `-`, arrasto por toque/mouse, e botões "Salvar" e "Cancelar".
-   Cada formato tem seu próprio estado de crop (zoom + posição X/Y) independente.

---

## 7. Exportação

-   **Exportar Todos:** exporta todos os 4 formatos de uma vez.
-   **Exportar formato único:** botão "Exportar" em cada preview individual.
-   **Modal de exportação:** Solicita o `slug` (nome do arquivo) e a escolha do formato de saída (PNG ou JPG).
-   **Nomenclatura:** `AAAA-MM-DD_ifmg_slug_nome-formato_LARGURAxALTURA.ext`
    -   Exemplo: `2025-09-09_ifmg_semana-calouros_instagram-post-1080x1350.png`
-   **Alerta de arquivo pesado:** Se a arte exportada ultrapassar **1,5 MB**, o sistema exibe um alerta nativo pedindo confirmação antes de baixar.

---

## 8. Histórico e Gamificação

-   Toda exportação bem-sucedida salva automaticamente um rascunho no **IndexedDB** local do navegador (máx. 10 itens, os mais antigos são removidos).
-   O histórico é acessível por um botão na tela inicial e na barra inferior do editor.
-   Um rascunho pode ser **restaurado** com um clique, voltando o editor ao estado exato do momento da exportação.
-   **Painel "Seu Impacto":** Exibido na tela inicial após a primeira exportação, mostrando quantas artes foram geradas e o tempo estimado de trabalho economizado (10 min por arte).
