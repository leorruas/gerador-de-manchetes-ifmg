# Tipos de Templates

O Manchete Express v2 oferece seis modelos pré-definidos, organizados em quatro estilos de layout principais. Cada template é otimizado para um tipo específico de comunicação institucional.

## 1. Estilos de Layout (Layout Types)

### Glass Box (Caixa de Vidro)
- **Descrição**: O estilo padrão do IFMG. Utiliza uma caixa semi-transparente com desfoque de fundo (`backdrop-filter: blur`).
- **Uso**: Notícias gerais, avisos e agenda.
- **Destaque**: Suporta o recurso de **Contrast Boost** para garantir legibilidade em fotos claras.

### Gradient (Gradiente)
- **Descrição**: Texto aplicado diretamente sobre a imagem, com um gradiente preto suave no fundo para garantir o contraste.
- **Uso**: Capas de reportagens, fotos de grande impacto visual e posts de destaque.

### Quote (Citação)
- **Descrição**: Layout centralizado com ícone de aspas. Foca na fala de uma pessoa ou trecho de documento.
- **Uso**: Entrevistas, depoimentos e frases de efeito.

### Infographic (Infográfico / Números)
- **Descrição**: Design minimalista focado em um dado numérico ou informação curta e centralizada.
- **Uso**: Resultados, rankings, datas comemorativas ou estatísticas.

---

## 2. Catálogo de Templates

| Nome | Layout | Cor de Fundo / Destaque | Uso Recomendado |
| :--- | :--- | :--- | :--- |
| **Notícia institucional** | Glass Box | Preto (50%) | Notícias do dia a dia, releases. |
| **Evento** | Glass Box | Azul (Agenda) | Divulgação de palestras, seminários. |
| **Comunicado** | Glass Box | Verde (Oficial) | Notas oficiais, editais, comunicados. |
| **Capa / Destaque** | Gradient | Gradiente Inferior | Matérias especiais, fotos de drone/paisagem. |
| **Citação** | Quote | Overlay Preto (60%) | Aspas de diretores, alunos ou professores. |
| **Número Destaque** | Infographic | Overlay Preto (40%) | "1º Lugar", "10 anos", "500 vagas". |

---

## 3. Comportamento dos Campos

Dependendo do template escolhido, os campos de **Editoria** e **Subtítulo** assumem funções diferentes:

- **Template Quote**: 
  - Editoria = Nome do Autor.
  - Subtítulo = Cargo ou Instituição.
- **Template Número**:
  - Editoria = O número ou dado de destaque (em fonte maior).
  - Subtítulo = Texto de apoio/contexto.
- **Templates Glass Box**:
  - Editoria = Eyebrow text (ex: "CAMPUS BAMBUÍ").
  - Subtítulo = Detalhamento da manchete.
