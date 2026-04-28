import Express from 'express'
import { AppDataSource } from './data-source';
import "reflect-metadata"

async function main() {
    const app = Express();
    const PORT = 3001;

    try {
        await AppDataSource.initialize();
    } catch (err) {
        console.error(err);
        return;
    }

    app.listen(PORT, () => console.info(`Server up on port ${PORT}!`))
}

main();
