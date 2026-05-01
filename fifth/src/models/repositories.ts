import { AppDataSource } from "../data-source";
import { Confirmation, Event, User } from "./entities";

export const confRepo = AppDataSource.getRepository(Confirmation)
export const eventRepo = AppDataSource.getRepository(Event)
export const userRepo = AppDataSource.getRepository(User);