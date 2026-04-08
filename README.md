> [!NOTE]
> **Lembretes para o Assistente:**
> - Não alterar o conteúdo do SVG do logo (internalizado em `constants.js`) sem instrução explícita.
> - Lembrar de sempre documentar todas as alterações em todos os arquivos relevantes para evitar inconsistências.
> - Não alterar a UX/UI do app, a não ser sob requisição.
> - Não deletar esses lembretes aqui.

# MancheteExpress

## 1. Sobre o Projeto

Uma aplicação para automatizar a criação de imagens institucionais padronizadas para redes sociais e portais do IFMG, permitindo que jornalistas gerem peças visuais de forma rápida e consistente, sem depender da equipe de design.

## 2. Funcionalidades Principais

- **Upload de imagem flexível:** permite o envio de imagens nos formatos JPG, PNG e WebP, tanto clicando para selecionar quanto arrastando e soltando o arquivo.
- **Múltiplos formatos:** gera automaticamente previews para Instagram Post, Instagram Stories, Portal dos Campi e Portal Principal.
- **Edição de manchete:** a manchete padrão aparece na imagem assim que ela é carregada, pronta para ser editada pelo usuário.
- **Logo institucional:** inclui o logo circular do IFMG automaticamente nas imagens de Instagram.
- **Posicionamento vertical:** a caixa de texto pode ser arrastada verticalmente de forma independente para cada formato.
- **Reenquadramento de imagem:** cada formato possui uma ferramenta própria de crop, com zoom e reposicionamento.
- **Exportação em lote ou individual:** permite exportar todos os formatos ou apenas um formato específico.
- **Persistência local:** salva a edição no navegador para continuar o trabalho depois.
- **Editorias e subtítulos:** permite complementar a arte com uma linha de editoria e um subtítulo opcional.
- **Templates institucionais:** traz presets leves para notícia, evento e comunicado.

## 3. Como Usar

1. Envie uma imagem JPG, PNG ou WebP.
2. Ajuste o reenquadramento em cada formato.
3. Edite a manchete diretamente no preview.
4. Use `**trecho**` para aplicar negrito em partes específicas do texto.
5. Se quiser, preencha editoria, subtítulo e escolha um template institucional.
6. Exporte tudo ou apenas um formato específico.

## 4. Estrutura Técnica

Este projeto foi consolidado como uma aplicação estática em HTML, CSS (Tailwind via CDN) e JavaScript puro.

- `index.html`: estrutura base da página.
- `index.js`: estado da aplicação, renderização, eventos e persistência local.
- `constants.js`: formatos, templates, ícones e SVGs institucionais.
- `services/richText.js`: renderização de texto com suporte a trechos em negrito.
- `services/canvasExport.js`: exportação final em canvas.

Essa abordagem mantém o projeto simples de abrir, testar e publicar, inclusive em ambientes onde não é possível instalar dependências locais.

### Estado Atual da Arquitetura

O projeto segue um caminho único: **aplicação estática em JavaScript puro**.

- O `index.html` pode ser aberto diretamente no navegador, sem servidor local.
- O `package.json` existe apenas como metadado do projeto.
- A interface foi adaptada para funcionar sem `type="module"` no navegador.

### Melhorias Aplicadas

- Feedback visual inline para upload e exportação, substituindo `alert()`.
- Persistência com `localStorage` para retomar a edição.
- Exportação individual por formato além da exportação em lote.
- Campo de editoria e subtítulo com suporte na prévia e na exportação.
- Templates institucionais básicos.
- Ajustes de responsividade para mobile.
- Acessibilidade mínima com foco visível, `aria-label` e `Esc` para fechar o modal.
- Quebra de linha balanceada na exportação para evitar linhas finais muito curtas nas artes com texto.

## 5. Deploy no GitHub Pages

Este projeto está pronto para ser publicado diretamente no GitHub Pages.

1. Acesse `Settings > Pages` no repositório.
2. Em `Build and deployment`, escolha `Deploy from a branch`.
3. Selecione a branch principal e a pasta `/(root)`.
4. Salve e aguarde a publicação.
