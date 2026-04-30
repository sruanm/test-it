import express from 'express'
import 'reflect-metadata'

async function main() {
    const app = express()
    const PORT = 3001;

    try {

    } catch (err) {
        console.error(`Error on db initialization: ${err}`);
        return;
    }

    app.listen(PORT, () => console.log(`Server up on port ${PORT}`))
}

main()