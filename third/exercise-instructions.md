Sim:

```typescript
try {
    const decoded = jwt.verify(token, "SECRET") as { sub: string };
    email = decoded.sub;
} catch {
    throw unauthorizedErr;
}
```

Se o token for inválido, o `jwt.verify` já lança exceção sozinho. Não precisa checar tipo nem null depois.

---

# PROVA PRÁTICA: DESAFIO TÉCNICO — SISTEMA DE VAGAS E CANDIDATURAS (EMPREGAÍ-PI)

## 1. CONTEXTO E OBJETIVO

A Secretaria do Trabalho do Piauí precisa de um sistema para conectar empresas parceiras a candidatos. Empresas publicam vagas de emprego e candidatos podem se candidatar a elas. O sistema deve garantir a integridade das candidaturas e as regras de negócio do programa.

---

## 2. REQUISITOS FUNCIONAIS

### Autenticação
- Cadastro e login de usuários
- Rotas de vagas e candidaturas são privadas

### Entidades

**Usuário:** `id`, `email`, `senha`

**Vaga:** `id`, `titulo`, `descricao`, `salario` (número), `publicador_id` (FK para o usuário que publicou)

**Candidatura:** `id`, `vaga_id` (FK), `candidato_id` (FK), `mensagem` (texto, opcional)

### Funcionalidades
- Publicar uma vaga
- Listar todas as vagas disponíveis — com filtro por faixa salarial (`salarioMin` e `salarioMax` como query params) e ordenação por salário (`orderBy=salario`, DESC)
- Ver candidaturas de uma vaga própria
- Se candidatar a uma vaga
- Cancelar uma candidatura própria

### Regras de Negócio
- Um usuário não pode se candidatar à própria vaga
- Um usuário não pode se candidatar à mesma vaga duas vezes
- Apenas o publicador da vaga pode ver as candidaturas dela
- Apenas o candidato pode cancelar sua própria candidatura

---

## 3. DURAÇÃO: 3 horas. Cronômetro começa agora.