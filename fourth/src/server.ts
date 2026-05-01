import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { AppDataSource } from './data-source'

async function main() {
    const app = express()
    const PORT = 3001

    app.use(express.json())
    app.use(cors())

    try {
        await AppDataSource.initialize();
    } catch (err) {
        console.error(err);
    }

    app.listen(PORT, () => console.info(`Server up on port ${PORT}`))
}

main();