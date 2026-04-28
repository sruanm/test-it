import { DataSource } from "typeorm";
import { Assisted, Benefit, User } from "./models/entities";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "db.sqlite",
  entities: [User, Assisted, Benefit],
  synchronize: true,
  logging: true,
});
