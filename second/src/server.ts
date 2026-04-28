import Express from 'express'
import { AppDataSource } from './data-source';
import "reflect-metadata"
import { errorMiddleware, logMiddleware } from './middlewares';
import { authRouter } from './routers/auth.router';

async function main() {
    const app = Express();
    const PORT = 3002;

    app.use(logMiddleware);


    app.use(authRouter);


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
