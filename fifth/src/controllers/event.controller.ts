import { NextFunction, Request, Response } from "express";
import { BadRequestError, ConflictError, HTTPError, NotFoundError, RoutesMisconfigurationError } from "../errors";
import { User, Event } from "../models/entities";
import { confRepo, eventRepo } from "../models/repositories";

type CreateEventBody = Omit<Event, "id" | "organizer">

function parseIntId(rawId: string | undefined) {
    if (!rawId) {
        throw new RoutesMisconfigurationError()
    }

    return parseInt(rawId)
}

function parseCreateEventBody(body: Partial<CreateEventBody> | undefined) {
    if (!body?.date || !body?.description || !body?.title || !body?.maxLimit) {
        throw new BadRequestError()
    }

    return {
        title: body.title,
        description: body.description,
        date: body.date,
        maxLimit: body.maxLimit
    }
}

export class EventController {
    static async listEvents(req: Request, res: Response, next: NextFunction) {
        try {
            const orderBy = req.query["orderBy"] as string | undefined;
            const date = req.query["date"] as string | undefined

            const events = await eventRepo.find({
                where: {
                    ...(date ? { date } : {})
                },
                order: {
                    ...(orderBy === 'maxLimit.desc' ? { maxLimit: 'DESC' } : {})
                }
            })

            return res.status(200).json(events)

        } catch (err) {
            return next(err);
        }
    }

    static async listEventConfirmations(req: Request, res: Response, next: NextFunction) {
        try {
            const loggedUser = (req as any).user as User;

            const eventId = parseIntId(req.params["id"]);

            const findedEvent = await eventRepo.findBy({ organizer: loggedUser, id: eventId })

            if (!findedEvent) {
                throw new NotFoundError();
            }

            const confirmations = await confRepo.find({
                where: {
                    event: findedEvent
                },
                relations: {
                    user: true
                }
            })

            return res.status(200).json(confirmations)
        } catch (err) {
            return next(err);
        }
    }

    static async createEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const loggedUser = (req as any).user as User;

            if (!loggedUser.isAdmin) {
                throw new HTTPError(403, "Forbidden")
            }

            const payload = parseCreateEventBody(req.body);

            const newEvent = eventRepo.create({
                ...payload,
                organizer: loggedUser
            });

            const { organizer: _, ...safeConfirmation } = await eventRepo.save(newEvent)

            return res.status(200).json(safeConfirmation)
        } catch (err) {
            return next(err);
        }
    }

    static async createConfirmation(req: Request, res: Response, next: NextFunction) {
        try {
            const eventId = parseIntId(req.params["id"]);

            const findedEvent = await eventRepo.findOne({
                where: {
                    id: eventId
                },
                relations: {
                    organizer: true
                }
            });

            if (!findedEvent) {
                throw new NotFoundError()
            }

            const loggedUser = (req as any).user as User;

            if (findedEvent.organizer.id === loggedUser.id) {
                throw new ConflictError('Organizer may not make a confirmation on his own event')
            }

            const findedConfirmation = await confRepo.findOneBy({ user: loggedUser });
            if (findedConfirmation) {
                throw new ConflictError('Users may not confirm twice')
            }

            const confirmationsCount = await confRepo.countBy({ event: findedEvent });
            if (confirmationsCount >= findedEvent.maxLimit) {
                throw new ConflictError('Confirmations max limit for this event was already reached')
            }

            const newConfirmation = confRepo.create({
                user: loggedUser,
                event: findedEvent
            })

            const { id } = await confRepo.save(newConfirmation);

            return res.status(200).json({ id })
        } catch (err) {
            return next(err);
        }
    }

    static async cancelConfirmation(req: Request, res: Response, next: NextFunction) {
        try {
            const [eventId, confirmationId] = [parseIntId(req.params["id"]), parseIntId(req.params["confId"])]

            const loggedUser = (req as any).user as User;

            const findedConfirmation = await confRepo.findOneBy({
                id: confirmationId,
                event: {
                    id: eventId
                },
                user: loggedUser
            })

            if (!findedConfirmation) {
                throw new NotFoundError()
            }

            await confRepo.delete(findedConfirmation.id);

            return res.status(204).send()
        } catch (err) {
            console.error(err)
            return next(err);
        }
    }
}