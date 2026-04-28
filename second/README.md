# InovaBooks  - SISTEMA DE AVALIAÇÃO DE LIVROS

O InovaBooks é um sistema de registros de livros feito para os servidores da Secretaria de Educação do Piauí. Ele permite que o usuário registre livros no catálogo da aplicação, e avalie os livros registrados por outros usuários.

A aplicação é desenvolvida em TypeScript, com servidor ExpressJS e utilizando TypeORM para persistência junto de um banco SQLite.

# Como executar
O projeto utiliza `npm` como gerenciador de pacotes. Para instalar as depêndencias, use:

```bash
npm i
```

E para subir o servidor de desenvolvimento, execute:

```bash
npm run dev
```

O servidor da aplicação estará disponível em http://localhost:3002. O TypeORM foi configurado no modo `synchronize: true`, então ao subir a aplicação, automaticamente o banco de dados SQLite será criado junto das tabelas.

# Estrutura do projeto
```text
src
   controllers/    # Fat controllers
   models/         # Entidades TypeORM
   routers/        # Roteadores HTTP

   data-source.ts  # Configuração do TypeORM
   errors.ts       # Classes de erro customizadas
   middlewares.ts  # Middlewares globais de log, erro e autenticação
   server.ts       # Entrypoint da aplicação, configuração do servidor Express 
```

# Decisões técnicas
Em detrimento do limite de tempo de execução da prova, a aplicação foi estruturada seguindo uma arquitetura MVC pragmática.
Desse modo, a aplicação é dividida em:
- Models (models/), que mapeiam os modelos de dados para entidades TypeORM;
- Routers (routers/), que definem as rotas da aplicação e conectam as requisições HTTP aos devidos controllers;
- Controllers (controllers/), que concentram todas as regras de negócio da aplicação, acesso ao banco de dados e tratamento da entrada e saída de dados na comunicação com o cliente. Podem ser considerados _fat controllers_.

# Endpoints

O servidor expõe os seguintes endpoints:

```text
/auth (Públicos)
POST   /auth/signup            # Usuário se cadastra         
POST   /auth/login             # Usuário faz login. Retorna um token de acesso

/books (Privados)
GET    /books                  # Usuário lista o catálogo de livros
GET    /books/:id/evaluations  # Usuário avalia um livro
POST   /books                  # Usuário registra um novo livro
POST   /books/:id/evaluations  # Usuário avalia um livro
DELETE /books/:id/evaluations  # Usuário deleta uma de suas avaliações
```

Para acesso as rotas privadas é necessário passar um token de acesso na header `Authorization: "Bearer <token>"`.