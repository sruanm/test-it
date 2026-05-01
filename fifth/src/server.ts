import cors from 'cors'
import express from 'express'
import 'reflect-metadata'
import { AppDataSource } from './data-source';
import { authMiddleware, errorMiddleware, logMiddleware } from './middlewares';
import { authRouter } from './routers/auth.router';
import { eventRouter } from './routers/event.router';

async function main() {
    const app = express();
    const PORT = 3001;

    app.use(express.json())
    app.use(cors())
    app.use(logMiddleware)

    app.use("/auth", authRouter)
    app.use(authMiddleware)
    app.use('/events', eventRouter)

    try {
        await AppDataSource.initialize()
    } catch (err) {
        console.error(err);
        return;
    }

    app.use(errorMiddleware)

    app.listen(PORT, () => console.info(`Server up on port ${PORT}!`))
}

main();