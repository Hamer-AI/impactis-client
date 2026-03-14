import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getOnboardingPath } from '@/modules/onboarding'
import { getWorkspaceIdentityForUser, getWorkspaceSettingsSnapshotForCurrentUser } from '@/modules/workspace'
import OrganizationInvitesPanel from '../../settings/OrganizationInvitesPanel'

export default async function SyndicatePage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect('/auth/login')

    const user = session.user
    const [identitySnapshot, settingsSnapshot] = await Promise.all([
        getWorkspaceIdentityForUser(null as any, user as any),
        getWorkspaceSettingsSnapshotForCurrentUser(null as any, {
            section: 'settings-invites',
            userId: user.id,
        }),
    ])

    const { membership } = identitySnapshot
    if (!membership) redirect(getOnboardingPath())

    const cookieStore = await cookies()
    const isLight = cookieStore.get('workspace_theme')?.value !== 'dark'
    const canEdit = membership.member_role === 'owner'
    const pendingInvites = settingsSnapshot?.pending_invites ?? []

    return (
        <section className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className={`absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full ${isLight ? 'bg-blue-500/5' : 'bg-blue-500/10'} blur-[120px]`} />
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                <div className="mx-auto max-w-4xl space-y-8">
                    <OrganizationInvitesPanel
                        canManage={canEdit}
                        pendingInvites={pendingInvites}
                        isLight={isLight}
                    />
                </div>
                <div className="h-20" />
            </div>
        </section>
    )
}
