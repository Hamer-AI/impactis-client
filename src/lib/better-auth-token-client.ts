/**
 * Client-safe way to get the Better Auth token.
 * Use this in code that runs in the browser (e.g. client components).
 * Do not import better-auth-token.ts here — it uses next/headers (server-only).
 */

const BETTER_AUTH_TOKEN_PATH = '/api/auth/token'

export async function getBetterAuthTokenClient(): Promise<string | null> {
    if (typeof window === 'undefined') {
        return null
    }
    try {
        const response = await fetch(BETTER_AUTH_TOKEN_PATH, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
        })
        if (!response.ok) return null
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
