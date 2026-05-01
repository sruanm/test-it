import { useEffect, useState } from "react";
import { getEvents } from "../api";
import type { Event } from "../types";

export function EventsPage() {
    const [events, setEvents] = useState<Event[] | null>(null)
    const [isPending, setIsPending] = useState(true)
    const [isError, setIsError] = useState(false)

    useEffect(() => {
        async function fecthData() {
            try {
                const data = await getEvents()
                setEvents(data)
            } catch {
                setIsError(true)
            } finally {
                setIsPending(false)
            }
        }

        fecthData();
    }, [])

    return (
        <div>
            <h1>Events</h1>
            <div>{isPending ? 'Searching for events...' : 'Busca concluída!'}</div>
            {events?.length && (
                <>
                    <ul>{events.map((event) => <li>{event.title} | {event.description}</li>)}</ul>
                </>
            )
            }
        </div>
    )
}