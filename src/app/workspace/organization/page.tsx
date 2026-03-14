import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getOnboardingPath } from '@/modules/onboarding'
import { getBetterAuthToken } from '@/lib/better-auth-token'
import { apiRequest } from '@/lib/api/rest-client'
import { getWorkspaceIdentityForUser, getWorkspaceSettingsSnapshotForCurrentUser } from '@/modules/workspace'
import { auth } from '@/lib/auth'
import SettingsForm from '../settings/SettingsForm'

function normalizeNullableInteger(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
    if (typeof value === 'string') {
        const parsed = Number.parseInt(value.trim(), 10)
        if (Number.isFinite(parsed)) return parsed
    }
    return null
}

export default async function OrganizationPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect('/auth/login')

    const user = session.user
    const [identitySnapshot, settingsSnapshot] = await Promise.all([
        getWorkspaceIdentityForUser(null as any, user as any),
        getWorkspaceSettingsSnapshotForCurrentUser(null as any, {
            section: 'settings-identity',
            userId: user.id,
        }),
    ])

    const { membership } = identitySnapshot
    if (!membership) redirect(getOnboardingPath())

    const cookieStore = await cookies()
    const isLight = cookieStore.get('workspace_theme')?.value !== 'dark'
    const canEdit = membership.member_role === 'owner'

    const startupProfile = settingsSnapshot?.startup_profile ?? null
    const isInvestorOrganization = membership.organization.type === 'investor'
    const investorProfile = isInvestorOrganization
        ? await (async () => {
            const token = await getBetterAuthToken()
            if (!token) return null
            const data = await apiRequest<{
                thesis: string | null
                sector_tags: string[]
                check_size_min_usd: number | null
                check_size_max_usd: number | null
            }>({
                path: 'organizations/me/investor-profile',
                method: 'GET',
                accessToken: token,
            })
            return data
        })()
        : null

    const investorThesis = typeof investorProfile?.thesis === 'string' ? investorProfile.thesis : ''
    const investorSectorTags = Array.isArray(investorProfile?.sector_tags)
        ? investorProfile.sector_tags
            .filter((tag): tag is string => typeof tag === 'string')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
            .join(', ')
        : ''
    const investorCheckSizeMinUsd = normalizeNullableInteger(investorProfile?.check_size_min_usd)
    const investorCheckSizeMaxUsd = normalizeNullableInteger(investorProfile?.check_size_max_usd)
    const industryTags =
        membership.organization.industry_tags?.length > 0
            ? membership.organization.industry_tags.join(', ')
            : ''

    return (
        <section className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className={`absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full ${isLight ? 'bg-blue-500/5' : 'bg-blue-500/10'} blur-[120px]`} />
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                <div className="mx-auto max-w-4xl space-y-8">
                    <SettingsForm
                        organizationType={membership.organization.type as 'startup' | 'advisor' | 'investor'}
                        defaultOrganizationName={membership.organization.name}
                        defaultOrganizationLocation={membership.organization.location ?? ''}
                        defaultOrganizationLogoUrl={membership.organization.logo_url ?? ''}
                        defaultOrganizationIndustryTags={industryTags}
                        defaultStartupWebsiteUrl={startupProfile?.website_url ?? ''}
                        defaultStartupTeamOverview={startupProfile?.team_overview ?? ''}
                        defaultStartupCompanyStage={startupProfile?.company_stage ?? ''}
                        defaultStartupFoundingYear={startupProfile?.founding_year ?? null}
                        defaultStartupTeamSize={startupProfile?.team_size ?? null}
                        defaultStartupTargetMarket={startupProfile?.target_market ?? ''}
                        defaultStartupBusinessModel={startupProfile?.business_model ?? ''}
                        defaultStartupTractionSummary={startupProfile?.traction_summary ?? ''}
                        defaultStartupFinancialSummary={startupProfile?.financial_summary ?? ''}
                        defaultStartupLegalSummary={startupProfile?.legal_summary ?? ''}
                        defaultInvestorThesis={investorThesis}
                        defaultInvestorSectorTags={investorSectorTags}
                        defaultInvestorCheckSizeMinUsd={investorCheckSizeMinUsd}
                        defaultInvestorCheckSizeMaxUsd={investorCheckSizeMaxUsd}
                        defaultStartupPostTitle=""
                        defaultStartupPostSummary=""
                        defaultStartupPostStage=""
                        defaultStartupPostLocation=""
                        defaultStartupPostIndustryTags=""
                        defaultStartupPostStatus="draft"
                        defaultStartupPostNeedAdvisor={false}
                        startupReadiness={null}
                        sectionView="identity"
                        canEdit={canEdit}
                        isLight={isLight}
                    />
                </div>
                <div className="h-20" />
            </div>
        </section>
    )
}
