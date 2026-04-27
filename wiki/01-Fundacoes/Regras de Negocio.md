# Regras de Negócio (v2)

## 0. Objetivo do Projeto

O **Manchete Express** é uma ferramenta estratégica de comunicação para o **IFMG**. Seu objetivo principal é democratizar a criação de artes institucionais de alta qualidade, permitindo que jornalistas e comunicadores gerem manchetes para redes sociais e portais em segundos, sem a necessidade de softwares complexos de design.

**Pilares fundamentais:**
- **Consistência Visual**: Garantir que toda peça produzida siga rigorosamente a identidade visual da instituição.
- **Agilidade**: Reduzir o tempo de produção de 10-15 minutos (em editores externos) para menos de 1 minuto.
- **Privacidade e Performance**: Operação 100% *client-side* (sem upload de dados para servidores), garantindo rapidez e segurança.

---

## 1. Modos de Operação

### Modo Multiformato (Campanha)
Neste modo, o usuário edita uma única notícia que é replicada automaticamente em 4 formatos:
- **Instagram Post** (1080x1350)
- **Instagram Story** (1080x1920)
- **LinkedIn Post** (1200x627)
- **Portal dos Campi** (400x400)
- **Portal Principal** (743x423)

### Safe Space (Margem de Segurança)
Para garantir a integridade do design em todos os enquadramentos:
- **Template HERO**: Possui uma trava de margem inferior (safe space) que impede que o texto encoste na borda, mantendo o respiro visual mesmo em ajustes manuais de posição.

### Modo Carrossel
Permite o upload de até **10 slides** diferentes.
- Cada slide pode ter sua própria imagem, manchete e enquadramento.
- O usuário navega entre slides por uma barra de miniaturas.
- **Reordenação**: Suporte a drag-and-drop na barra de navegação para reordenar a sequência narrativa dos slides livremente após o upload.
- **Limite de Memória**: O sistema bloqueia novos uploads se o total acumulado em Base64 ultrapassar **45 MB**, visando estabilidade em dispositivos móveis.
- **Normalização de Imagem**: Todo upload passa por um processo de redimensionamento automático para no máximo **2400px** (maior lado) e compressão via Canvas antes de entrar no estado da aplicação.

## 2. Sistema de Templates

Existem **7 templates** que alteram drasticamente a composição visual:
- **NEWS, EVENT, NOTICE**: Usam a *Glass Box* (caixa translúcida com desfoque).
- **HERO**: Layout limpo com gradiente na base.
- **QUOTE**: Overlay escuro para citações e ícone de aspas.
- **NUMBER**: Destaque para estatísticas com número gigante centralizado.
- **CAROUSEL_STORY** (História Completa): Layout narrativo focado em múltiplas imagens sequenciais, com regras tipográficas próprias e otimizado para o Instagram.

## 3. Gestão de Conteúdo e Sincronização

### Campos de Texto
- **Editoria (Eyebrow)**: Campo superior, geralmente em maiúsculas.
- **Manchete (Headline)**: Campo principal com suporte a **Rich Text** (`**negrito**`, `*itálico*`, `$$destaque$$`).
- **Subtítulo**: Campo de apoio opcional.

### Sincronização e Governança de Texto
- **Modo Independente**: Por padrão, cada formato pode ter sua própria manchete, permitindo ajustes de quebra de linha específicos para Story ou Post.
- **Auto-Sync Global**: Quando ativado, qualquer edição em um campo (Editoria, Manchete ou Subtítulo) é replicada em tempo real para todos os formatos do slide ativo.
- **Sincronização entre Slides (Carrossel)**:
  - **Sincronizar Manchetes**: Copia textos entre slides diferentes.
  - **Sincronizar Metadados**: Copia template, visibilidade de campos e contraste entre slides.
  - **Exceção de Interface**: Os botões de sincronização manual em lote ficam **ocultos** quando o template ativo é o "História Completa", pois este formato pressupõe manchetes únicas por slide.
  - **Escopo de Auto-Sync**: No carrossel, o "Auto-Sync Global" sincroniza apenas as **Editorias**, permitindo que cada slide tenha sua própria manchete/narrativa.

### Visibilidade de Campos Opcionais
- Os campos **Editoria** e **Subtítulo** são opcionais.
- A visibilidade é controlada individualmente por formato através dos botões flutuantes (+/-).
- Campos ocultos não são renderizados na exportação final.

## 4. Editor de Imagem (Crop & Zoom)

### Modos de Enquadramento
- **Cover**: A imagem preenche todo o espaço disponível, podendo haver cortes laterais ou verticais dependendo da proporção.
- **Contain (Ajustar)**: A imagem é reduzida para caber inteira no canvas. Neste modo, aplicamos automaticamente **bordas arredondadas** (3% da largura) e margens de segurança para um visual "card".

### Atalhos de Teclado (Modo Crop)
| Tecla | Ação |
| :--- | :--- |
| `Setas` | Move a imagem (passo de 0.03) |
| `Shift + Setas` | Move a imagem rapidamente (passo de 0.08) |
| `+` ou `=` | Aumenta o Zoom (máx 3x) |
| `-` | Diminui o Zoom (mín 1x) |
| `Escape` | Fecha modais ativos |

## 5. Exportação e Resiliência

### Regras de Exportação
- **Formatos**: PNG (sem perda) ou JPG (alta performance).
- **Controle de Peso**: Se o arquivo gerado for maior que **1.5 MB**, o sistema exibe um alerta de confirmação.
- **Nomenclatura**: `AAAA-MM-DD_ifmg_slug_nome-formato_WxH.ext`.

### Persistência Híbrida (v4)
- **LocalStorage**: Mantém apenas a estrutura lógica (textos, coordenadas, templates) sob o `schemaVersion: 4`. As imagens são removidas do JSON antes do salvamento (`stripImagesFromState`).
- **IndexedDB**: Armazena as imagens binárias (Base64) indexadas pelo ID do slide. Isso remove o limite teórico de 5MB, permitindo carrosséis complexos com alta fidelidade.
- **Migração**: O sistema detecta versões antigas (v1, v2 e v3) e realiza a migração automática:
    - **v1 -> v2**: Transforma o objeto único em uma estrutura de lista (`slides`).
    - **v2 -> v3**: Migra campos simples de texto para objetos por formato.
    - **v3 -> v4**: Adiciona suporte a layouts individuais de carrossel e extrai imagens para o IndexedDB.

## 6. Governança de Código
- **Script Order**: O projeto depende de uma ordem estrita de carregamento em `index.html` devido ao uso de globais.
- **Contracts**: O arquivo `app/contracts.js` valida se todos os handlers necessários estão presentes antes da inicialização.
- **Size Limit**: Arquivos JS não devem ultrapassar **250 linhas** para manter a modularidade.

