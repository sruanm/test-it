import { DataSource } from "typeorm";
import { Lote, Produtor, SolicitacaoInsumo, Usuario } from "./models/entities";

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "db.sqlite",
    entities: [Usuario, Produtor, Lote, SolicitacaoInsumo],
    logging: true,
    synchronize: true
})