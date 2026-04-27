# Principais Problemas do Projeto

Este documento serve como mapa rapido para agentes e mantenedores entenderem onde o projeto ainda esta fragil. Ele nao substitui `BUGS.md`; aqui ficam problemas estruturais, riscos recorrentes e dividas tecnicas.

## 1. Dependencia forte da ordem dos scripts

O projeto usa JavaScript global carregado por varias tags `<script>` em `index.html`. Isso preserva a simplicidade de app estatico, mas cria acoplamento implicito:

- `constants.js` precisa vir antes dos servicos.
- `richText.js` precisa vir antes dos arquivos de canvas.
- `canvasExportHelpers.js`, `canvasExportLayoutsA.js`, `canvasExportLayoutsB.js` e `canvasExportText.js` precisam vir antes de `canvasExport.js`.
- `app/core.js` precisa vir antes de qualquer handler/template.
- `app/render.js` precisa existir antes de `app/init.js`.

Se alguem reorganizar o HTML sem entender essa cadeia, a aplicacao quebra em runtime. Uma melhoria simples seria documentar a ordem no proprio `index.html`; uma melhoria maior seria adotar build com ES Modules/Vite.

## 2. Muitos contratos globais sem verificacao

Os arquivos compartilham estado e funcoes por objetos globais:

- `window.appConstants`
- `window.richTextService`
- `window.canvasExportService`
- `window.canvasExportHelpers`
- `window.canvasExportLayouts`
- `window.canvasExportText`
- `window.mancheteApp`
- `window.mancheteTemplates`

Isso facilita abrir o projeto sem build, mas nao ha verificacao automatica de que cada contrato foi carregado corretamente. Erros aparecem apenas no navegador. O risco aumenta quando agentes pequenos editam um arquivo isolado e nao percebem que outro arquivo depende daquele nome global.

## 3. Falta de testes automatizados

Hoje a validacao real depende de smoke test manual no navegador e `node --check` para sintaxe. Nao ha testes para:

- restauracao de estado salvo no `localStorage`;
- persistencia e restauracao de historico no IndexedDB;
- calculo de crop/zoom por formato;
- quebra de linha e rich text no canvas;
- consistencia entre preview HTML e imagem exportada;
- exportacao em lote/carrossel.

O primeiro pacote de testes deveria cobrir funcoes puras como rich text, slug, calculo de imagem e migracao de estado. Depois, testes de browser poderiam validar upload, crop e exportacao.

## 4. Preview HTML e exportacao canvas ainda podem divergir

A UI de preview e o motor de exportacao desenham a mesma arte por caminhos diferentes:

- preview: HTML/CSS em `app/template-preview.js`;
- exportacao: Canvas 2D em `services/canvasExport*.js`.

Qualquer ajuste visual precisa ser feito em dois lugares. Isso ja gerou bugs historicos de alinhamento, texto e blur. O ideal seria extrair tokens compartilhados para tamanhos, paddings, line-heights e layouts, ou criar testes visuais que comparem preview e exportacao.

## 5. Documentacao parcialmente desatualizada

Alguns documentos ainda descrevem a arquitetura antiga como se `index.js` concentrasse estado, renderizacao e eventos. Depois da refatoracao, a estrutura real esta dividida em:

- `app/core.js`
- `app/preview-metrics.js`
- `app/handlers-*.js`
- `app/template-*.js`
- `app/render.js`
- `app/init.js`
- `services/canvasExport*.js`

O `README.md` e outros documentos devem ser atualizados para evitar que futuros agentes procurem a logica no lugar errado.

## 6. Estado persistido precisa de estrategia de versao

O app ja tem migracoes pontuais para estados antigos, mas nao existe um `schemaVersion` claro salvo junto do estado. Isso dificulta evoluir:

- novos formatos;
- novos templates;
- campos opcionais;
- estrutura de carrossel;
- mudancas em `transforms` e `hideText`.

Recomendacao: salvar `schemaVersion` no `localStorage` e no IndexedDB, com funcoes explicitas de migracao por versao.

## 7. Handlers inline tornam refatoracoes mais arriscadas

Os templates HTML chamam funcoes diretamente via atributos como `onclick`, `oninput`, `ondrop` e `ontouchstart`. Por isso os nomes em `window.*` viraram API publica interna. Renomear uma funcao sem buscar nos templates quebra interacao.

Uma melhoria incremental seria criar um arquivo `app/public-api.js` listando explicitamente todas as funcoes globais esperadas pelos templates. Uma melhoria maior seria renderizar com listeners via JavaScript, sem atributos inline.

## 8. Exportacao depende de APIs sensiveis do navegador

O fluxo de exportacao usa:

- `document.fonts.load`;
- `canvas.toBlob`;
- `URL.createObjectURL`;
- download por clique programatico em `<a>`.

Essas APIs podem se comportar diferente entre navegadores, mobile e politicas de bloqueio de downloads multiplos. O projeto ja inclui delays no lote, mas ainda falta uma estrategia mais robusta para navegadores que bloqueiam varios downloads seguidos.

## 9. Acessibilidade ainda e minima

Existe uso de `aria-label`, foco visivel e fechamento por `Esc`, mas ainda faltam pontos importantes:

- navegacao completa por teclado no crop;
- ajuste fino por setas;
- feedback acessivel durante exportacao;
- alternativa para interacoes baseadas em drag;
- melhor descricao dos controles de template e formato.

Isso importa porque o app e uma ferramenta de trabalho, nao apenas uma pagina visual.

## 10. Sem pipeline de qualidade

O projeto nao tem lint, formatador, teste, build ou checagem de tamanho/ordem de scripts. Para manter a simplicidade, um pipeline minimo ja ajudaria:

- `npm run check`: `node --check` em todos os `.js`;
- teste unitario leve para `services/richText.js`;
- script que falha se algum arquivo passar de 250 linhas;
- smoke test local documentado.

Esse pipeline reduziria bastante regressao causada por edicoes pequenas.
