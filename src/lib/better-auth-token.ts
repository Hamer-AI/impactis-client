import { headers } from 'next/headers'

const BETTER_AUTH_TOKEN_PATH = '/api/auth/token'

export async function getBetterAuthToken(): Promise<string | null> {
    try {
        const cookieHeader = (await headers()).get('cookie') ?? ''
        if (!cookieHeader) {
            return null
        }

        const baseUrl = process.env.BETTER_AUTH_URL?.replace(/\/+$/, '') || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}${BETTER_AUTH_TOKEN_PATH}`, {
            method: 'GET',
            headers: {
                cookie: cookieHeader,
            },
            cache: 'no-store',
        })

        if (!response.ok) {
            return null
        }

        const data = (await response.json()) as { token?: unknown }
        const token =
            typeof data.token === 'string' && data.token.trim().length > 0
                ? data.token.trim()
                : null

        return token
    } catch {
        return null
    }
}

