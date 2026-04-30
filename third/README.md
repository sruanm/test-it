# InovaVagas (SISTEMA DE VAGAS E CANDIDATURAS)

O InovaVagas é um sistema que permite que seus usuários cadastrem e se candidatem a vagas de emprego. A aplicação é desenvolvida em ExpressJS, com TypeORM e SQLite para persistência de dados.

### Como executar
O sistema usa `npm` como gerenciador de pacotes. Para instalar as depêndencias do projeto, use:

```bash
npm i
```

Para executar o servidor de desenvolvimento, utilize o comando:
```bash
npm run dev
```

A aplicação estará disponível http://localhost:3001.
O TypeORM está configurado com `synchronize: true`, então automaticamente ele criará um arquivo do banco de dados SQLite já com as tabelas.

### Estrutura de pastas

```text
src/
    controllers/     # Fat controllers
    models/          # Mapeamento das entidades para o TypeORM
    routers/         # Definição das rotas da aplicação

    data-source.ts   # Configuração do TypeORM
    errors.ts        # Classe de erro customizada
    middlewares.ts   # Middlewares globais de erro e autenticação
    server.ts        # Configuração do servidor Express
```

### Decisões técnicas

Devido ao limite de tempo da prova, optou-se por uma arquitetura MVC pragmática para a organização do projeto.
Deste modo, a aplicação é divida em três camadas:
- Models (models/), que definem as entidades de dados a serem mapeadas pelo TypeORM;
- Routers (routers/), que esquematizam as rotas da aplicação, sendo cada arquivo responsável por um recurso. Também entregam as requisições HTTP para os devidos controllers;
- Controllers (controllers/), que abrangem as regras de negócio, o acesso ao banco de dados e o tratamento de entrada e saída de dados na comunicação com o cliente. Podem ser considerados, portanto, _fat controllers_.

### Endpoints

A aplicação define a seguinte API:

```text
/auth (Públicos)
POST   /auth/signup   # Usuário se cadastra
POST   /auth/login    # Usuário faz login. Retorna um token de acesso.

/job-opportunities (Privados)
POST   /job-opportunities   # Usuário registra uma vaga de emprego
GET    /job-opportunities   # Usuário lista todas as vagas do sistema
GET    /job-opportunities/:id/submissions   # Usuário lista todas as candidaturas a uma vaga registrada por ele
POST   /job-opportunities/:id/submissions   # Usuário se candidata a uma vaga
DELETE /job-opportunities/:id/submissions/:id   # Usuário cancela sua candidatura a uma vaga
```

Para acessar os endpoints privados é necessário passar um token de acesso na header _Authorization_, do seguinte modo: `Bearer: <token>`.
