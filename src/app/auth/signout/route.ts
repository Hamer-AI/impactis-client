import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
    const response = NextResponse.redirect(new URL('/', request.url), { status: 303 })

    await auth.api.signOut({
        headers: request.headers,
    })
    return response
}
