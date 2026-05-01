import express from 'express'
import cors from 'cors'
import 'reflect-metadata'
import { authMiddleware, errorMiddleware, logMiddleware } from './middlewares';
import { authRouter } from './routers/auth.router';
import { AppDataSource } from './data-source';

async function main() {
    const app = express()
    const PORT = 3001;

    app.use(express.json())
    app.use(cors())
    app.use(logMiddleware("req"))


    app.use(authRouter);
    app.use(authMiddleware);


    app.use(logMiddleware("res"))
    app.use(errorMiddleware)

    try {
        await AppDataSource.initialize()
    } catch (err) {
        console.error(`Error on db initialization: ${err}`);
        return;
    }

    app.listen(PORT, () => console.log(`Server up on port ${PORT}`))
}

main()