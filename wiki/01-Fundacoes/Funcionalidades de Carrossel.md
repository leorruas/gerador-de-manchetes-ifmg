# Funcionalidades de Carrossel

O Modo Carrossel permite a criação de múltiplas artes de forma simultânea, facilitando a produção de posts para o Instagram (sequenciais) ou coberturas de eventos com várias fotos sob a mesma identidade.

## 1. Navegação e Gestão de Slides

Cada card de formato no preview exibe controles de carrossel no topo:
- **Troca de Slide**: Botões numerados permitem alternar rapidamente entre as fotos carregadas.
- **Adicionar Slide**: O ícone de `+` permite carregar novas imagens para o projeto atual a qualquer momento, expandindo o carrossel durante a edição sem perder o progresso atual.
- **Limite**: O sistema suporta até **10 slides** por projeto.

## 2. Ferramentas de Sincronização em Lote

Para garantir agilidade em coberturas de grandes eventos, o sistema oferece dois botões de sincronização rápida:

### Sincronizar Manchetes
- **O que faz**: Copia os textos (Editoria, Manchete e Subtítulo) do slide atual para **todos os outros slides** do projeto.
- **Uso Ideal**: Quando você tem várias fotos de um mesmo evento e quer manter exatamente o mesmo texto em todas, apenas ajustando o enquadramento.

### Sincronizar Metadados
- **O que faz**: Replica as configurações de interface do slide atual para os demais, incluindo:
    - Template selecionado.
    - Estado de visibilidade dos campos (Editoria/Subtítulo).
    - Configurações de Contraste (Contrast Boost).
    - Slug do projeto.
- **Uso Ideal**: Para garantir que todos os slides sigam o mesmo padrão visual e configuração de campos.

## 3. Exportação em Lote (Batch Export)

Ao detectar que o projeto possui mais de um slide, o botão principal de exportação muda seu comportamento:
- **Exportar**: Abre o modal de exportação individual para o slide ativo.
- **Exportar Tudo**: Gera um arquivo ZIP contendo todos os slides do carrossel processados para aquele formato específico.

## 4. Limites e Performance

Devido ao processamento ser 100% no navegador:
- **Memória**: O sistema monitora o uso de Base64 e impede novos slides se o limite de estabilidade for atingido (aprox. 45MB de dados de imagem).
- **Processamento**: A exportação em lote pode levar alguns segundos dependendo da quantidade de slides e da resolução das imagens originais.
