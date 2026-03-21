import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getOnboardingPath } from '@/modules/onboarding'
import {
    getBillingPlansForCurrentUser,
    type BillingCurrentPlanSnapshot,
    type BillingPlan,
} from '@/modules/billing'
import { getWorkspaceIdentityForUser, getWorkspaceSettingsSnapshotForCurrentUser } from '@/modules/workspace'
import BillingPlanManager from '../settings/BillingPlanManager'

function resolveSingleSearchParam(value: string | string[] | undefined): string | null {
    if (typeof value === 'string') {
        const normalized = value.trim()
        return normalized.length > 0 ? normalized : null
    }
    if (Array.isArray(value) && value.length > 0) {
        const first = value[0]?.trim()
        return first && first.length > 0 ? first : null
    }
    return null
}

function resolveStripeCheckoutStatus(value: string | string[] | undefined): 'success' | 'cancel' | null {
    const normalized = resolveSingleSearchParam(value)?.toLowerCase()
    if (normalized === 'success' || normalized === 'cancel') return normalized
    return null
}

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
    if (typeof value !== 'string') return fallback
    const normalized = value.trim().toLowerCase()
    if (normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on') return true
    if (normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'off') return false
    return fallback
}

export default async function SubscriptionPage({
    searchParams,
}: {
    searchParams: Promise<{ stripe?: string | string[] }>
}) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect('/auth/login')

    const user = session.user
    const identitySnapshot = await getWorkspaceIdentityForUser(user as any)
    const { membership } = identitySnapshot
    if (!membership) redirect(getOnboardingPath())

    const [settingsSnapshot, billingPlansSnapshot] = await Promise.all([
        getWorkspaceSettingsSnapshotForCurrentUser({
            section: 'settings-billing',
            userId: user.id,
        }),
        getBillingPlansForCurrentUser({ segment: membership.organization.type }),
    ])

    const cookieStore = await cookies()
    const isLight = cookieStore.get('workspace_theme')?.value !== 'dark'
    const canManageBilling = membership.member_role === 'owner' || membership.member_role === 'admin'

    const resolvedParams = await searchParams
    const stripeCheckoutStatus = resolveStripeCheckoutStatus(resolvedParams.stripe)

    const currentPlan: BillingCurrentPlanSnapshot | null = settingsSnapshot?.current_plan ?? null
    const billingPlans: BillingPlan[] = billingPlansSnapshot?.plans ?? []

    const billingStripeRedirectEnabled = parseBooleanEnv(
        process.env.BILLING_STRIPE_REDIRECTS_ENABLED ?? process.env.NEXT_PUBLIC_BILLING_STRIPE_REDIRECTS_ENABLED,
        true
    )
    const billingSiteUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim())
    const billingApiBaseUrlConfigured = Boolean(process.env.NEXT_PUBLIC_IMPACTIS_API_URL?.trim())

    return (
        <section className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className={`absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full ${isLight ? 'bg-blue-500/5' : 'bg-blue-500/10'} blur-[120px]`} />
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                <div className="mx-auto max-w-4xl space-y-8">
                    <BillingPlanManager
                        plans={billingPlans}
                        currentPlan={currentPlan}
                        canManage={canManageBilling}
                        billingStripeRedirectEnabled={billingStripeRedirectEnabled}
                        billingSiteUrlConfigured={billingSiteUrlConfigured}
                        billingApiBaseUrlConfigured={billingApiBaseUrlConfigured}
                        stripeCheckoutStatus={stripeCheckoutStatus}
                        isLight={isLight}
                    />
                </div>
                <div className="h-20" />
            </div>
        </section>
    )
}
