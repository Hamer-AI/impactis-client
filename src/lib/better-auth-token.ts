import { headers } from 'next/headers'

const BETTER_AUTH_TOKEN_PATH = '/api/auth/token'

function getTokenBaseUrl(): string {
    const envUrl = process.env.BETTER_AUTH_URL?.replace(/\/+$/, '')
    if (envUrl) {
        return envUrl.includes('localhost') ? envUrl.replace(/localhost/g, '127.0.0.1') : envUrl
    }
    return 'http://127.0.0.1:3000'
}

export async function getBetterAuthToken(): Promise<string | null> {
    try {
        const h = await headers()
        const cookieHeader = h.get('cookie') ?? ''
        if (!cookieHeader) {
            return null
        }
        const host = h.get('host') ?? h.get('x-forwarded-host')
        let baseUrl: string
        if (host) {
            const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
            baseUrl = `${protocol}://${host}`
            if (baseUrl.includes('localhost')) {
                baseUrl = baseUrl.replace(/localhost/g, '127.0.0.1')
            }
        } else {
            baseUrl = getTokenBaseUrl()
        }
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

