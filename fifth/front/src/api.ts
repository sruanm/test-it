import type { Event, User } from "./types";

const baseUrl = import.meta.env.VITE_PUBLIC_API_URL;

export async function sign(mode: 'signup' | 'login', credentials: { email: string, password: string, isAdmin: boolean }): Promise<{ user: User, token?: string }> {
    try {

        const res = await fetch(`${baseUrl}/auth/${mode}`, {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const body = await res.json()

        if (!res.ok) {
            throw body;
        }

        return mode === 'signup' ? { user: body } : body
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function getEvents(): Promise<Event[]> {
    try {
        const token = localStorage.getItem("token")

        if (!token) {
            unauthorized();
        }

        const res = await fetch(`${baseUrl}/events`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const body = await res.json()

        if (!res.ok) {
            throw body;
        }

        return body as Event[]
    } catch (err) {
        console.error(err);
        throw err;
    }
}

function unauthorized() {
    window.location.reload();
}