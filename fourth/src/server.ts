import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { AppDataSource } from './data-source'
import { authMiddleware, errorMiddleware, logMiddleware } from './middlewares'
import { authRouter } from './routers/auth.router'
import { produtorRouter } from './routers/produtor.router'
import { produtorSolicitacaoRouter, tecnicoSolicitacaoRouter } from './routers/solicitacao.router'

async function main() {
    const app = express()
    const PORT = 3001

    app.use(express.json())
    app.use(cors())
    app.use(logMiddleware)

    app.use("/auth", authRouter)
    app.use(authMiddleware())

    app.use("/produtores", produtorRouter)
    app.post("/solicitacoes-de-insumo", produtorSolicitacaoRouter,)
    app.use("/solicitacoes-de-insumo", tecnicoSolicitacaoRouter,)

    try {
        await AppDataSource.initialize();
    } catch (err) {
        console.error(err);
    }

    app.use(errorMiddleware)

    app.listen(PORT, () => console.info(`Server up on port ${PORT}`))
}

main();