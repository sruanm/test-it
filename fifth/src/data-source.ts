import { DataSource } from 'typeorm'
import { User, Event, Confirmation } from './models/entities'

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "db.sqlite",
    entities: [User, Event, Confirmation],
    synchronize: true,
    logging: true
})