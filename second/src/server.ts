import Express from 'express'
import { AppDataSource } from './data-source';
import "reflect-metadata"
import { errorMiddleware, logMiddleware } from './middlewares';

async function main() {
    const app = Express();
    const PORT = 3002;

    app.use(logMiddleware);

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
