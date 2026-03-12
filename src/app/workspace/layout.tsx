import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getOnboardingPath, getOnboardingQuestionsPath } from '@/modules/onboarding'
import { getWorkspaceIdentityForUser } from '@/modules/workspace'
import WorkspaceHeader from './WorkspaceHeader'
import WorkspaceLayoutShell from './WorkspaceLayoutShell'
import { WorkspaceThemeProvider } from './WorkspaceThemeContext'

function toTitleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export default async function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect('/auth/login')
    }

    const user = session.user
    const identitySnapshot = await getWorkspaceIdentityForUser(null as any, user as any)
    const { profile, membership } = identitySnapshot

    if (!membership) {
        redirect(getOnboardingPath())
    }

    const cookieStore = await cookies()
    const themeCookie = cookieStore.get('workspace_theme')?.value
    const isLight = themeCookie === 'light'

    const workspaceLabel = `${toTitleCase(membership.organization.type)} workspace`

    return (
        <WorkspaceThemeProvider initialIsLight={isLight}>
            <WorkspaceLayoutShell
                initialIsLight={isLight}
                membership={membership}
                profile={profile}
                organizationCoreTeam={[]}
                verificationMeta={null}
                workspaceLabel={workspaceLabel}
                header={
                    <WorkspaceHeader
                        workspaceLabel={workspaceLabel}
                        displayName={profile.full_name?.trim() || membership.organization.name}
                        email={user.email ?? null}
                        avatarUrl={profile.avatar_url}
                        initialIsLight={isLight}
                        organizationType={membership.organization.type}
                    />
                }
            >
                {children}
            </WorkspaceLayoutShell>
        </WorkspaceThemeProvider>
    )
}
