# InovaCultura

o InovaCultura é um sistema para gestão e divulgação de eventos. Os usuários organizadores publicam eventos, enquanto os cidadãos podem confirmar ou cancelar presença nos eventos. O servidor é feito em ExpressJS, com TypeORM e SQLite para persistência de dados.

### Como executar

O projeto utiliza `npm` como gerenciador de pacotes, então tenha certeza de que ele está instalado antes de prosseguir.

Para fazer a instalação das dependências do projeto, execute em seu terminal:

```bash
npm i
```

Em seguida, para iniciar o servidor de desenvolvimento, use:

```bash
npm run dev
```

O servidor estará disponível em http://localhost:3001. O TypeORM está configurado com `synchronize: true`, portanto, sempre que o servidor for iniciado ele criará automaticamente o arquivo do banco de dados SQLite, caso não exista, e sincronizará as tabelas com as últimas alterações do código.

### Estrutura de pastas

O código da aplicação é estruturado da seguinte forma:

```text
src/
    controllers/     # Fat controllers
    models/          # Entidades TypeORM
    routers/         # Definição das rotas da aplicação

    data-source.ts   # Configuração do TypeORM
    errors.ts        # Classes de erro customizadas
    middlewares.ts   # Middlewares globais de erro e autenticação
    server.ts        # Configuração do servidor Express. Entrypoint da aplicação.
```

### Decisões técnicas

Devido ao limite de tempo, adotou-se uma arquitetura MVC pragmática na organização do projeto.
Desse modo, a aplicação é dividida em três camadas:
- Models (models/), que mapeiam os modelos de dados para entidades TypeORM;
- Routers (routers/), que definem as rotas da aplicação e entregam as requisições HTTP para os devidos controllers;
- Controllers (controllers/), que abrangem a maior parte da lógica, incluindo acesso ao banco de dados, regras de negócio e tratamento de entrada e saída de dados na comunicação com o cliente. Podem, portanto, ser considerados _fat controllers_.

### Endpoints

O servidor expõe a seguinte API:

```text
/auth   (Endpoints públicos)
POST   /auth/signup   # Usuário se cadastra
POST   /auth/login    # Usuário faz login. Retorna um token de acesso

/events (Endpoints privados)
GET    /events        # Usuário lista todos os eventos. Aceita parâmetros de consulta.
POST   /events        # Organizador registra um evento
GET    /events/:id/confirmations   # Organizador vê lista de presenças em um evento próprio
POST   /events/:id/confirmations   # Usuário confirma sua presença em um evento
DELETE /events/:id/confirmations/:confId   # Usuário cancela sua presença em um evento
```

Para acesso aos endpoints privados, é necessário passar um token de acesso na header _Authorization_, do seguinte modo: `Bearer: <token>`.