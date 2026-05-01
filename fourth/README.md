# InovaAgro (SISTEMA DE DISTRIBUIÇÃO DE INSUMOS)


### Como executar
O projeto usa `npm` como gerenciador de pacotes. Para instalar as dependências, utilize:

```bash
npm i
```

E então, para iniciar o servidor de desenvolvimento, execute:

```bash
npm run dev
```

O servidor estará disponível em http://localhost:3001. O TypeORM foi configurado com `synchronize: true`, portanto sempre que o servidor for iniciado, ele automaticamente criará o arquivo do banco SQLite, se não existir, junto com as tabelas atualizadas.

### Estrutura de diretórios

```text
src/
    controllers/     # Fat controllers
    models/          # Mapeando dos modelos de dados para o TypeORM
    routers/         # Definição das rotas da aplicação

    data-source.ts   # Configuração do TypeORM
    errors.ts        # Classes de erro customizadas
    middlewares.ts   # Definição dos middlewares globais de erro e autenticação
    server.ts        # Configuração do servidor Express

```

### Decisões técnicas
Devido ao limite de tempo da prova, adotou-se uma arquitetura MVC pragmática.
Deste modo, o projeto é dividido nas seguintes camadas:
- Models (models/), que mapeiam as entidades de dados para o TypeORM
- Routers (routers/), que definem as rotas da aplicação, entregando as requisições HTTP para os devidos controllers
- Controllers (controllers/), que abrangem a maior parte do processamento, sendo responsáveis pelas regras de negócio, pelo acesso ao banco de dados, e pelo tratamento da entrada e saída de dados na comunicação com o cliente. Podem, portanto, ser considerados _fat controllers_.

### Endpoints

A aplicação entrega a seguinte API:

```text
(Endpoints públicos)
/auth

POST /auth/signup   # Técnico se cadastra
POST /auth/login    # Usuário faz login

(Endpoints privados)
/produtores
POST /produtores   # Tećnico cadastra produtor
POST /produtores/:id/lotes   # Técnico cadastra lote de produtor

/solicitacoes-de-insumo
POST /solicitacoes-de-insumo   # Produtor solicita insumo para seu lote
GET  /solicitacoes-de-insumo   # Técnico lista solicitações em seu município
PUT  /solicitacoes-de-insumo/:id   # Técnico altera o status de uma solicitação
```


