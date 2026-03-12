import { NextResponse } from 'next/server'
import { getBetterAuthToken } from '@/lib/better-auth-token'
import { resolveApiBaseUrl } from '@/lib/api/rest-client'

export const dynamic = 'force-dynamic'

export async function GET() {
    const token = await getBetterAuthToken()
    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const apiBaseUrl = resolveApiBaseUrl(process.env.NEXT_PUBLIC_IMPACTIS_API_URL)
    if (!apiBaseUrl) {
        return NextResponse.json(
            { message: 'API URL not configured' },
            { status: 502 }
        )
    }

    const url = `${apiBaseUrl}/workspace/bootstrap`
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })

        if (!res.ok) {
            const text = await res.text()
            return NextResponse.json(
                { message: text || `API returned ${res.status}` },
                { status: res.status >= 500 ? 502 : res.status }
            )
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reach API'
        return NextResponse.json(
            { message },
            { status: 502 }
        )
    }
}
