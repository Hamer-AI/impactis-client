type User = {
    id: string
    email?: string | null
    last_sign_in_at?: string | null
    user_metadata?: Record<string, unknown>
}
import { isOnboardingPath } from '@/modules/onboarding'
import { getDashboardPathForRole, getPostAuthRedirectPath, isWorkspacePath, isAuthEntryPath, isPublicPath } from './routing'

type MiddlewareContext = {
    pathname: string
    user: User | null
    hasOrganizationMembership: boolean
    isPlatformAdmin: boolean
}

export type MiddlewareDecision =
    | { type: 'allow' }
    | { type: 'redirect'; destination: string }

export function decideMiddlewareNavigation({
    pathname,
    user,
    hasOrganizationMembership,
    isPlatformAdmin,
}: MiddlewareContext): MiddlewareDecision {
    const publicPath = isPublicPath(pathname)

    if (!user && !publicPath) {
        return { type: 'redirect', destination: '/auth/login' }
    }

    if (!user) {
        return { type: 'allow' }
    }
    const metadata = (user as any)?.user_metadata as Record<string, unknown> | undefined

    if (!hasOrganizationMembership) {
        if (isOnboardingPath(pathname)) {
            return { type: 'allow' }
        }

        if (isWorkspacePath(pathname) || isAuthEntryPath(pathname) || !publicPath) {
            return { type: 'redirect', destination: getPostAuthRedirectPath(false) }
        }

        return { type: 'allow' }
    }

    // User has membership. Allow access to workspace and onboarding;
    // high-level onboarding routing is handled in app routes/layouts.

    // Allow logged-in users to open login/signup (e.g. to switch account or create another).
    // Otherwise they would always be redirected to workspace and never see auth pages.
    if (isAuthEntryPath(pathname)) {
        return { type: 'allow' }
    }

    return { type: 'allow' }
}
