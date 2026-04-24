# InovaAssist
O InovaAssist permite que assistentes sociais gerenciem de maneira simples seus beneficiários. Com regras para concessão de benefícios, o sistema garante que os seus usuários concedam benefícios agindo de acordo com o seu regimento.

### Como rodar
O projeto utiliza `npm` como gerenciador de pacotes. O ORM da aplicação, TypeORM está configurado com `syncronize: true`, portanto ao subir o servidor, o ORM automaticamente criará o arquivo do banco de dados SQLite juntamente das tabelas.

Para executar o servidor de desenvolvimento, utilize:

```bash
npm run dev
```

### Estrutura de pastas
```text
controllers/    # Fat controllers
models/         # Entidades TypeORM
routers/        # Roteadores da aplicação

data-source.ts  # Configuração do TypeORM
errors.ts       # Classe de erro customizada
middlewares.ts  # Middlewares globais de errp e autenticação
server.ts       # Configuração do servidor Express
```

### Decisões técnicas
Devido ao limite de tempo de execução da prova prática, optou-se por organizar o projeto utilizando uma arquitetura MVC pragmática, em detrimento de arquiteturas com mais abstrações, como a Arquitetura de Camadas.
Desse modo, o projeto é dividido em Models (models/), Routers (routers/) e Controllers (controllers/). Os Models usam TypeORM para representar as entidades de dados e mapeá-las para o banco. Os Routers mapeiam as rotas e entregam as requisições HTTP para os devidos controllers. Os Controllers são _fat controllers_, eles concentram toda a lógica de acesso ao banco, regras de negócio e tratamento de entrada e saída de dados trocadados com o cliente.

### Endpoints

O servidor backend conta com os seguintes endpoints:

```text

/auth (Públicos)
POST     /auth/login              # Assitente faz login. Retorna um token de acesso.
POST     /auth/signup             # Assistente se cadastra

/assisteds (Privados)
GET      /assisteds               # Assistente lista todos os seus beneficiários
POST     /assisteds               # Assistente cria um novo beneficiário
POST     /assisteds/:id/benefits  # Assistente cria um auxílio para seu beneficiário
DELETE   /assisteds/:id/benefits/:benefitId  # Assistente deleta um auxílio
```

Para acesso aos endpoints privados, é necessário primeiro utilizar o token de acesso retornado no login, passando-o na header Authorization como "Bearer <token>".