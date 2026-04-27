# Agent Workflow: Coding Excellence

Este workflow é obrigatório para todas as tarefas na branch `v2`. Ele integra os princípios de Andrej Karpathy no ciclo de vida do desenvolvimento.

## Ciclo de Trabalho

### 1. Fase de Descoberta & Análise
- **Skill**: `coding_excellence`
- **Ação**: Identificar o arquivo alvo e ler apenas o trecho necessário.
- **Output**: Descrição verbal do problema e da solução proposta antes de qualquer `replace`.

### 2. Fase de Planejamento Cirúrgico
- **Princípio**: Surgical Changes.
- **Ação**: Criar um plano que altere o menor número de linhas possível.
- **Output**: Artifact `implementation_plan.md` (para tarefas complexas) ou resumo direto (para simples).

### 3. Fase de Execução Minimalista
- **Princípio**: Simplicity First.
- **Ação**: Aplicar as mudanças usando `replace_file_content` ou `multi_replace_file_content`.
- **Regra**: Não refatorar código adjacente.

### 4. Fase de Verificação de Meta
- **Princípio**: Goal-Driven.
- **Ação**: Validar a mudança (syntax check, manual verify, etc).
- **Ação**: Se falhar, reverter e tentar um caminho mais simples em vez de acumular hacks.

## Gatilhos de Pausa (Stop Rules)
- Se a mudança afetar mais de 50 linhas em um único arquivo, pausar para revisão de simplicidade.
- Se o plano exigir uma nova biblioteca externa, pausar para aprovação explícita.
- Se houver dúvida sobre o impacto visual, gerar um mockup/screenshot antes de implementar.
