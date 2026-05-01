# PROVA PRÁTICA: DESAFIO TÉCNICO — SISTEMA DE EVENTOS CULTURAIS (CULTURATECH-PI)

## 1. CONTEXTO E OBJETIVO

A Secretaria de Cultura do Piauí precisa de um sistema para divulgar eventos culturais e permitir que cidadãos confirmem presença. Organizadores publicam eventos e cidadãos podem confirmar ou cancelar presença.

---

## 2. REQUISITOS FUNCIONAIS

### Autenticação
- Cadastro e login de usuários
- Rotas de eventos e presenças são privadas

### Entidades

**Usuário:** `id`, `email`, `senha`

**Evento:** `id`, `titulo`, `descricao`, `data` (string), `capacidade` (número inteiro), `organizador_id` (FK)

**Presenca:** `id`, `evento_id` (FK), `participante_id` (FK)

### Funcionalidades
- Criar um evento
- Listar todos os eventos — com filtro por `data` (query param) e ordenação por `capacidade` (`orderBy=capacidade`, DESC)
- Ver lista de presenças de um evento próprio
- Confirmar presença em um evento
- Cancelar presença própria

### Regras de Negócio
- Organizador não pode confirmar presença no próprio evento
- Usuário não pode confirmar presença duas vezes no mesmo evento
- Apenas o organizador pode ver a lista de presenças do seu evento
- Apenas o participante pode cancelar sua própria presença
- Não é possível confirmar presença em evento que já atingiu a capacidade máxima

---

## 3. DURAÇÃO: 3 horas. Cronômetro começa agora.