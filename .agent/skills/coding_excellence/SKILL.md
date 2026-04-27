# Coding Excellence (Karpathy Style)

Este guia define a "skill" de excelência em programação, baseada nos princípios observados por Andrej Karpathy para interações eficientes entre humanos e IAs.

## Diretrizes Operacionais

### 1. Think Before Coding (Pense antes de codar)
- **Ação**: Antes de abrir qualquer arquivo para edição, descreva as suposições e o plano.
- **Ramificações**: Apresente caminhos alternativos se houver ambiguidade.
- **Recuo Estratégico**: Se o plano parecer complexo demais, pare e procure uma solução mais simples (ex: CSS puro vs JS complexo).

### 2. Simplicity First (Simplicidade Primeiro)
- **Minimalismo**: Escreva a menor quantidade de código possível para atingir a meta.
- **Sem Engenharia Especulativa**: Não adicione tratamento de erros para cenários impossíveis ou abstrações "para o futuro".
- **Legibilidade**: Código "burro" e legível é melhor que código "esperto" e denso.

### 3. Surgical Changes (Mudanças Cirúrgicas)
- **Foco**: Altere apenas as linhas estritamente necessárias para a tarefa.
- **Limpeza**: Limpe apenas o que você tocou (imports não usados, variáveis órfãs da sua mudança).
- **Respeito ao Legado**: Não refatore partes do arquivo que não fazem parte do objetivo, mesmo que pareçam "feias", a menos que impeçam a tarefa.

### 4. Goal-Driven Execution (Execução Baseada em Metas)
- **Definição de Sucesso**: Transforme pedidos vagos em critérios de sucesso verificáveis antes de começar.
- **Loop de Iteração**: Trabalhe em ciclos pequenos: Codar -> Verificar -> Ajustar.
- **Meta-Consciência**: Pare se sentir que está andando em círculos ou se a tarefa divergiu demais do plano aprovado.

## Critérios de Rejeição
- Deletar grandes blocos de código funcional sem substituto direto.
- Introduzir dependências novas quando as existentes resolvem o problema.
- Fazer "over-coding" (resolver problemas que o usuário não pediu).
