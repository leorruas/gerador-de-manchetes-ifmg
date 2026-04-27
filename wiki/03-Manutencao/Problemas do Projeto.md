# ⚠️ Problemas do Projeto e Melhorias

Este documento rastreia dívidas técnicas, bugs estruturais e pontos de atenção.

## 🏁 Problemas Resolvidos

### ✅ 5. Documentação desatualizada
- **Status**: RESOLVIDO (v2)
- **Ação**: Toda a documentação foi migrada para a Wiki em `/wiki`. Os documentos agora refletem a arquitetura modular (`/app` e `/services`) em vez do `index.js` único.

### ✅ 3. Falta de Testes de Regressão Visual
- **Status**: MITIGADO
- **Ação**: Foi criado `npm run check`, que executa `node --check` em todos os arquivos JS e falha se algum arquivo passar de 250 linhas.
- **Observação**: Teste visual automatizado continua sendo uma evolução de qualidade, mas não há item estrutural aberto neste documento.

### ✅ 4. Gestão de Memória no Navegador
- **Status**: MITIGADO
- **Ação**: O upload agora limita o carrossel a 10 slides e bloqueia novas imagens quando o total aproximado em Base64 passa de 45 MB.
- **Observação**: Uma futura otimização poderia trocar Base64 por `Blob`/Object URL, mas o risco operacional imediato está coberto pelos limites de quantidade e tamanho.

### ✅ Dependência forte da ordem dos scripts
- **Status**: MITIGADO
- **Ação**: `index.html` documenta a ordem esperada e `npm run check` agora falha se a ordem das tags `<script>` divergir do contrato.

### ✅ Contratos globais sem verificação
- **Status**: MITIGADO
- **Ação**: `app/contracts.js` valida em runtime os globais e handlers públicos exigidos pela camada de eventos antes da inicialização.

### ✅ Handlers inline nos templates
- **Status**: RESOLVIDO
- **Ação**: Os atributos `onclick`, `oninput`, `onblur`, `onchange`, `ondrop`, `onmousedown` e equivalentes foram removidos dos templates. A ligação entre HTML renderizado e handlers agora passa por `data-action`, `data-blur-action`, `data-dropzone` e `data-drag-type`, centralizada em `app/events.js`.

### ✅ Estado persistido sem versão
- **Status**: MITIGADO
- **Ação**: O estado salvo agora inclui `schemaVersion`, e estados antigos sem versão são tratados como versão 1 para futuras migrações.

### ✅ Acessibilidade do crop por teclado
- **Status**: RESOLVIDO
- **Ação**: Em modo crop, setas movem a imagem, `Shift + seta` aumenta o passo, e `+`/`-` ajustam zoom. As caixas de texto também recebem foco e podem ser movidas com `↑`, `↓`, `Home` e `End`.

### ✅ Duplicação de Lógica: Preview vs Exportação
A lógica de renderização da "Glass Box" (paddings, tamanhos de fonte, line-height) está duplicada: uma em HTML/CSS (`template-preview.js`) e outra em Canvas (`canvasExportLayoutsA.js`).
- **Risco**: Inconsistência visual entre o que o usuário vê e o que é baixado.
- **Status**: RESOLVIDO COMO ARQUITETURA
- **Ação**: Os tokens de layout sensíveis foram extraídos para `services/layoutTokens.js` e são usados no preview e no Canvas para Glass Box, Gradient, Quote e Infographic.
- **Observação**: Ainda seria saudável adicionar teste visual automatizado, mas a duplicação de números mágicos foi removida dos templates principais.

### ✅ Sincronização de Manchetes no Carrossel
No modo Carrossel, a sincronização de textos entre slides era rudimentar (via Auto-Sync global).
- **Risco**: Usuário pode querer sincronizar apenas a Editoria mas manter Manchetes diferentes.
- **Status**: RESOLVIDO
- **Ação**: O carrossel agora expõe ações separadas para copiar apenas Manchetes ou apenas Metadados do slide atual para os demais slides.

---

## 🚧 Problemas em Aberto (Dívida Técnica)

Nenhuma dívida técnica aberta neste documento no momento. Novos problemas devem ser adicionados aqui com risco, impacto e proposta de correção.

---

## 📈 Próximos Passos
Consulte **[[Ideias de Evolucao]]** para ver o backlog de novas funcionalidades.
