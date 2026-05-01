import { DataSource } from "typeorm";
import { JobOpportunity, Submission, User } from "./models/entities";

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "db.sqlite",
    entities: [User, JobOpportunity, Submission],
    logging: true,
    synchronize: true
})