import { DataSource } from "typeorm";
import { Book, Evaluation, User } from "./models/entities";

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "db.sqlite",
    entities: [User, Book, Evaluation],
    logging: true,
    synchronize: true,
})