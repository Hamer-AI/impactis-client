import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getOnboardingPath } from '@/modules/onboarding'
import { getWorkspaceBootstrapForCurrentUser, getWorkspaceIdentityForUser } from '@/modules/workspace'
import SyndicateManagementClient from './SyndicateManagementClient'

export default async function WorkspaceSyndicatePage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect('/auth/login')

    const user = session.user
    const identitySnapshot = await getWorkspaceIdentityForUser(user as any)
    const { membership } = identitySnapshot
    if (!membership) redirect(getOnboardingPath())

    if (membership.organization.type !== 'investor') {
        redirect('/workspace/invite-teams')
    }

    const cookieStore = await cookies()
    const isLight = cookieStore.get('workspace_theme')?.value !== 'dark'
    const textMainClass = isLight ? 'text-slate-900' : 'text-slate-100'
    const textMutedClass = isLight ? 'text-slate-500' : 'text-slate-400'

    const bootstrapSnapshot = await getWorkspaceBootstrapForCurrentUser(user as any)
    const organizations = (bootstrapSnapshot.discovery_feed ?? []).map((o) => ({
        id: o.org_id,
        name: o.name,
        type: o.org_type as 'startup' | 'investor' | 'advisor'
    }))

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-10">
            <h1 className={`text-2xl font-black ${textMainClass}`}>Syndicate management</h1>
            <p className={`mt-2 text-sm font-semibold ${textMutedClass}`}>
                Create syndicates, invite co-investors, and track status. Requires Elite tier (API-enforced).
            </p>
            <div className="mt-8">
                <SyndicateManagementClient organizations={organizations} />
            </div>
        </main>
    )
}
