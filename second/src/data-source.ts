import { DataSource } from "typeorm";
import { Book, User } from "./models/entities";

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "db.sqlite",
    entities: [User, Book,],
    logging: true,
    synchronize: true,
})