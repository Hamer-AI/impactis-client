import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
    decideMiddlewareNavigation,
    isAuthEntryPath,
    isWorkspacePath,
} from '@/modules/auth'
import { isPlatformAdminUser } from '@/modules/admin'
import { isOnboardingPath } from '@/modules/onboarding'
import { hasOrganizationMembershipForUser } from '@/modules/organizations'

const MEMBERSHIP_CACHE_COOKIE = 'impactis_membership'
const MEMBERSHIP_CACHE_MAX_AGE_SECONDS = 60

function readMembershipCache(request: NextRequest, userId: string): boolean | null {
    const rawValue = request.cookies.get(MEMBERSHIP_CACHE_COOKIE)?.value
    if (!rawValue) {
        return null
    }

    const [cachedUserId, cachedMembership] = rawValue.split(':', 2)
    if (cachedUserId !== userId) {
        return null
    }

    if (cachedMembership === '1') {
        return true
    }

    if (cachedMembership === '0') {
        return false
    }

    return null
}

function writeMembershipCache(response: NextResponse, userId: string, hasMembership: boolean): void {
    response.cookies.set(MEMBERSHIP_CACHE_COOKIE, `${userId}:${hasMembership ? '1' : '0'}`, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: MEMBERSHIP_CACHE_MAX_AGE_SECONDS,
    })
}

export async function proxy(request: NextRequest) {
    const url = request.nextUrl.clone()
    const session = await auth.api.getSession({
        headers: request.headers,
    })
    const user = session?.user ?? null
    const onboardingPath = isOnboardingPath(url.pathname)
    const workspacePath = isWorkspacePath(url.pathname) || url.pathname.startsWith('/workspace/')
    const isPlatformAdmin = user ? isPlatformAdminUser(user as any) : false
    const cachedMembership = user ? readMembershipCache(request, user.id) : null
    const shouldUseCachedMembership = cachedMembership !== null && !onboardingPath
    const shouldResolveMembership =
        !!user
        && !isPlatformAdmin
        && !shouldUseCachedMembership
        && (
            onboardingPath
            || isAuthEntryPath(url.pathname)
            || workspacePath
        )
    let membershipLookupFailed = false
    let resolvedMembership = !!user
    if (shouldResolveMembership && user) {
        try {
            resolvedMembership = await hasOrganizationMembershipForUser(null as any, user as any, {
                throwOnRequestError: true,
            })
        } catch (error) {
            membershipLookupFailed = true
            const message = error instanceof Error ? error.message : 'Unknown membership middleware error'
            console.warn(`[auth-middleware] Membership lookup failed for user ${user.id}: ${message}`)
            resolvedMembership = true
        }
    }

    const hasOrganizationMembership = shouldUseCachedMembership
        ? cachedMembership
        : resolvedMembership
    const decision = decideMiddlewareNavigation({
        pathname: url.pathname,
        user,
        hasOrganizationMembership,
        isPlatformAdmin,
    })

    const shouldWriteMembershipCache = !!user
        && !isPlatformAdmin
        && !shouldUseCachedMembership
        && !membershipLookupFailed

    if (decision.type === 'redirect') {
        url.pathname = decision.destination
        const redirectResponse = NextResponse.redirect(url)
        if (shouldWriteMembershipCache && user) {
            writeMembershipCache(redirectResponse, user.id, hasOrganizationMembership)
        }

        return redirectResponse
    }

    const nextResponse = NextResponse.next()
    if (shouldWriteMembershipCache && user) {
        writeMembershipCache(nextResponse, user.id, hasOrganizationMembership)
    }

    return nextResponse
}

export const config = {
    matcher: [
        '/auth/:path*',
        '/workspace/:path*',
        '/onboarding/:path*',
    ],
}
