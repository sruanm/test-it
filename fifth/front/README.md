# InovaEventos Front

Cliente frontend da aplicação InovaEventos. O aplicativo é feito em React com Vite e TypeScript.

### Como executar o projeto

Primeiro crie um arquivo para as variáveis de ambiente, e o configure de acordo:

```bash
cp .env.example .env
```

O projeto utiliza `npm` como gerenciador de pacotes, então tenha certeza de que ele está instalado antes de prosseguir.

Para fazer a instalação das dependências do projeto, execute em seu terminal:

```bash
npm i
```

Em seguida, para iniciar o servidor de desenvolvimento, use:

```bash
npm run dev
```

O servidor estará disponível em http://localhost:5173

### Estrutura de pastas

```text
src/
  pages/    # Definição das páginas da aplicação

  api.ts    # Funções para comunicação com o servidor backend
  App.tsx   # Definição das "rotas"
  types.ts  # Tipos da aplicação
```