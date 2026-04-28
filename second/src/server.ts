import express from 'express'
import { AppDataSource } from './data-source';
import "reflect-metadata"
import { errorMiddleware, logMiddleware } from './middlewares';
import { authRouter } from './routers/auth.router';
import cors from 'cors'
import { bookRouter } from './routers/book.router';

async function main() {
    const app = express();
    const PORT = 3002;

    app.use(cors())
    app.use(express.json())
    app.use(logMiddleware);


    app.use("/auth", authRouter);
    app.use("/books", bookRouter)


    app.use(errorMiddleware);

    try {
        await AppDataSource.initialize();
    } catch (err) {
        console.error(err);
        return;
    }

    app.listen(PORT, () => console.info(`Server up on port ${PORT}!`))
}

main();
