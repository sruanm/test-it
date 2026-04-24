import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import "reflect-metadata";
import { authMiddleware, errorMiddleware } from "./middlewares";
import { authRouter } from "./routers/auth.router";
import { assistedRouter } from "./routers/assisted.router";

async function main() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  await AppDataSource.initialize();

  app.use("/auth", authRouter);

  app.use(authMiddleware);
  app.use("/assisteds", assistedRouter);

  app.use(errorMiddleware);

  app.listen(3001, () => console.log("Server up!"));
}

main();
