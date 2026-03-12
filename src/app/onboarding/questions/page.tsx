import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getDashboardPathForRole, getPostAuthRedirectPath } from '@/modules/auth'
import { getOnboardingPath } from '@/modules/onboarding'
import { hasOrganizationMembershipForUser } from '@/modules/organizations'
import { OnboardingEntryClient } from '../OnboardingEntryClient'

export default async function OnboardingQuestionsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect('/auth/login')
    }

    const user = session.user as any
    const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>

    // Require org membership first (authoritative check).
    const hasMembership = await hasOrganizationMembershipForUser(null as any, user, {
        failOpenOnRequestError: false,
    })
    if (!hasMembership) {
        redirect(getOnboardingPath())
    }

    const questionnaire = (metadata.onboarding_questionnaire ?? null) as
        | {
              completed?: boolean
              skipped?: boolean
          }
        | null
    const onboardingCompletedFlag = metadata.onboardingCompleted === true
    const onboardingSkippedFlag = metadata.onboardingSkipped === true
    const questionnaireDone = questionnaire?.completed === true || questionnaire?.skipped === true

    if (onboardingCompletedFlag || onboardingSkippedFlag || questionnaireDone) {
        // Prefer role-based dashboard path when available; fall back to generic post-auth redirect.
        const destination =
            typeof metadata.role !== 'undefined'
                ? getDashboardPathForRole(metadata.role)
                : getPostAuthRedirectPath(true, { skipCache: true })
        redirect(destination)
    }

    const role =
        typeof metadata.role === 'string'
            ? metadata.role
            : typeof metadata.intended_org_type === 'string'
                ? metadata.intended_org_type
                : 'startup'

    const onboardingStep =
        typeof metadata.onboardingStep === 'number' ? Math.max(0, Math.trunc(metadata.onboardingStep)) : 0
    const onboardingData = (metadata.onboardingData && typeof metadata.onboardingData === 'object' && metadata.onboardingData !== null)
        ? (metadata.onboardingData as Record<string, unknown>)
        : {}
    const initialValues = (onboardingData[role] && typeof onboardingData[role] === 'object' && onboardingData[role] !== null)
        ? (onboardingData[role] as Record<string, unknown>)
        : {}

    return (
        <main className="min-h-screen bg-white px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
                <OnboardingEntryClient role={role} initialStep={onboardingStep} initialValues={initialValues} />
            </div>
        </main>
    )
}

