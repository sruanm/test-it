Aqui está um novo desafio técnico, mantendo a temática regional, o nível de dificuldade e a
estrutura de pontuação dos seus exemplos.
PROVA PRÁTICA: DESAFIO TÉCNICO —
SISTEMA DE DISTRIBUIÇÃO DE
INSUMOS (AGROTECH-PI)
1. CONTEXTO E OBJETIVO
A Secretaria de Desenvolvimento Rural (SDR) do Piauí precisa de um sistema para
gerenciar a distribuição de kits de irrigação e sementes para pequenos produtores rurais. O
objetivo é evitar o desperdício e garantir que a ajuda chegue a quem realmente cultiva a
terra, respeitando limites de cota por hectare e a regionalização do estado.
2. REQUISITOS FUNCIONAIS
Autenticação
● Cadastro e login de Técnicos de Campo e Produtores.
● Apenas Técnicos podem cadastrar novos Produtores e Lotes.
● Produtores podem apenas solicitar Insumos.
Entidades e Atributos
● Produtor: id (UUID), nome, CPF, municipio, area_total_hectares.
● Lote: id (UUID), produtor_id (FK), cultura (Caju, Milho, Feijão), tamanho_lote (em
hectares).
● SolicitacaoInsumo: id (UUID), lote_id (FK), tecnico_id (FK), tipo_insumo (Semente,
Fertilizante, Kit Irrigação), quantidade, status (Pendente, Aprovado, Negado).
Lógica de Backend (O "Nó" do Desafio)
● Regra de Capacidade: A soma dos tamanhos dos Lotes vinculados a um Produtor
não pode ultrapassar a area_total_hectares declarada no cadastro do produtor.
● Cota de Insumo: Cada hectare de um Lote dá direito a no máximo 50kg de insumo
(seja semente ou fertilizante). Se o lote tem 2 hectares, a solicitação não pode
passar de 100kg.
● Privacidade Territorial: Um Técnico de Campo só pode listar e gerenciar
solicitações de produtores que pertençam ao mesmo municipio do cadastro do
Técnico.
● Filtros e Ordenação: Listar solicitações filtrando por status e municipio, ordenando
pela quantidade (DESC).
3. REQUISITOS TÉCNICOS
● Backend: Node.js (Express ou NestJS) com TypeScript e Prisma ou TypeORM.
● Banco de Dados: SQLite (pela praticidade do ambiente de prova).
● Frontend: React com Vite (pode usar Tailwind CSS para agilizar o estilo).
● Documentação: Arquivo README.md com instruções de instalação e uma breve
explicação de como a validação de cota por hectare foi implementada.
4. CRITÉRIOS DE AVALIAÇÃO (TOTAL: 1.000 PONTOS)
Competência Descrição Pontuação
1. Domínio de Backend Implementação correta das travas de cota
(kg/hectare) e validação de área.
250 pts
2. Segurança e Rotas Proteção de rotas por JWT e lógica de
permissão por município (Técnico).
200 pts
3. Desenvolvimento
Frontend
Interface limpa, formulários com feedback de
erro e consumo de API.
200 pts
4. Modelagem de Dados Relacionamentos corretos e uso de UUIDs. 150 pts
5. Qualidade e
Documentação
Código limpo, modularizado e README
explicativo.
200 pts
5. DURAÇÃO: 3 horas. Cronômetro começa agora.
Dica de "Ouro" (Estilo Exemplo 1):
Não faça isso:
TypeScript
const totalArea = await prisma.lote.findMany({ where: { produtorId } });
// ... somar no JS e depois salvar
Sim:
Utilize o _sum do seu ORM ou uma query SQL para calcular o total de área
ocupada diretamente no banco de dados antes de permitir a criação de um
novo lote. Isso evita condições de corrida (race conditions).