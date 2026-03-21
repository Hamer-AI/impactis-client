import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getOnboardingPath } from '@/modules/onboarding'
import { getWorkspaceIdentityForUser, getWorkspaceSettingsSnapshotForCurrentUser } from '@/modules/workspace'
import OrganizationInvitesPanel from '../settings/OrganizationInvitesPanel'

export default async function InviteTeamsPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect('/auth/login')

    const user = session.user
    const [identitySnapshot, settingsSnapshot] = await Promise.all([
        getWorkspaceIdentityForUser(user as any),
        getWorkspaceSettingsSnapshotForCurrentUser({
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

    const textMainClass = isLight ? 'text-slate-900' : 'text-slate-100'
    const textMutedClass = isLight ? 'text-slate-500' : 'text-slate-400'

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-10">
            <h1 className={`text-2xl font-black ${textMainClass}`}>Invite teams</h1>
            <p className={`mt-2 text-sm font-semibold ${textMutedClass}`}>
                Invite users to your organization by email. Owners can manage pending invitations.
            </p>
            <div className="mt-8">
                <OrganizationInvitesPanel canManage={canEdit} pendingInvites={pendingInvites} isLight={isLight} />
            </div>
        </main>
    )
}
