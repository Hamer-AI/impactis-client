import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
    Building2,
    CircleDollarSign,
    ClipboardList,
    FolderLock,
    Gauge,
    Rocket,
    Settings2,
    ShieldCheck,
    Users,
} from 'lucide-react'
import { auth } from '@/lib/auth'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getOnboardingPath } from '@/modules/onboarding'
import {
    type OrganizationOutgoingInvite,
    type OrganizationVerificationStatus,
} from '@/modules/organizations'
import {
    getBillingMeForCurrentUser,
    getBillingPlansForCurrentUser,
    resolveDataRoomDocumentsFeatureGate,
    type BillingCurrentPlanSnapshot,
    type BillingPlan,
} from '@/modules/billing'
import {
    getStartupDataRoomDocumentsForCurrentUser,
    type StartupDataRoomDocument,
} from '@/modules/startups'
import { getBetterAuthToken } from '@/lib/better-auth-token'
import { apiRequest } from '@/lib/api/rest-client'
import {
    getWorkspaceBootstrapForCurrentUser,
    getWorkspaceIdentityForUser,
    getWorkspaceSettingsSnapshotForCurrentUser,
} from '@/modules/workspace'
import BillingPlanManager from './BillingPlanManager'
import DataRoomSection from './DataRoomSection'
import OrganizationInvitesPanel from './OrganizationInvitesPanel'
import { type SettingsSectionItem } from './SettingsSectionNavigator'
import SettingsForm from './SettingsForm'
import PermissionsSection from './sections/PermissionsSection'
import TeamAccessSection from './sections/TeamAccessSection'
import ReadinessRulesSection from './sections/ReadinessRulesSection'

function toTitleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

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
    if (normalized === 'success' || normalized === 'cancel') {
        return normalized
    }

    return null
}

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
    if (typeof value !== 'string') {
        return fallback
    }

    const normalized = value.trim().toLowerCase()
    if (normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on') {
        return true
    }

    if (normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'off') {
        return false
    }

    return fallback
}

function getVerificationMeta(status: OrganizationVerificationStatus): {
    label: string
    variant: BadgeProps['variant']
} {
    if (status === 'approved') {
        return { label: 'Approved', variant: 'success' }
    }

    if (status === 'pending') {
        return { label: 'Pending Review', variant: 'warning' }
    }

    if (status === 'rejected') {
        return { label: 'Rejected', variant: 'destructive' }
    }

    return { label: 'Unverified', variant: 'secondary' }
}

function normalizeNullableInteger(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.round(value)
    }

    if (typeof value === 'string') {
        const parsed = Number.parseInt(value.trim(), 10)
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }

    return null
}

function getSectionPresentation(sectionId: string): {
    title: string
    description: string
    badgeVariant: BadgeProps['variant']
    icon: typeof Building2
} {
    if (sectionId === 'settings-startup-readiness') {
        return {
            title: 'Startup Profile',
            description: 'Maintain profile metadata here. Readiness documents are sourced from Investor Data Room files.',
            badgeVariant: 'warning',
            icon: Gauge,
        }
    }

    if (sectionId === 'settings-billing') {
        return {
            title: 'Subscription & Billing',
            description: 'Manage current subscription tier, interval, and plan entitlements for your organization.',
            badgeVariant: 'outline',
            icon: CircleDollarSign,
        }
    }

    if (sectionId === 'settings-discovery') {
        return {
            title: 'Startup Discovery Post',
            description: 'Control how your startup appears in advisor and investor discovery feeds.',
            badgeVariant: 'outline',
            icon: Rocket,
        }
    }

    if (sectionId === 'settings-data-room') {
        return {
            title: 'Investor Data Room',
            description: 'Centralize diligence documents for investor review. Core readiness documents are now managed from the same document system.',
            badgeVariant: 'outline',
            icon: FolderLock,
        }
    }

    if (sectionId === 'settings-invites') {
        return {
            title: 'Team Invites',
            description: 'Invite admins and members with secure, expiring organization links.',
            badgeVariant: 'secondary',
            icon: Users,
        }
    }

    if (sectionId === 'settings-permissions') {
        return {
            title: 'Permission Rules',
            description: 'Review governance rules enforced by membership role and organization status.',
            badgeVariant: 'secondary',
            icon: ShieldCheck,
        }
    }

    if (sectionId === 'settings-team-access') {
        return {
            title: 'Team Access',
            description: 'Define how owners, admins, and members collaborate inside your organization.',
            badgeVariant: 'secondary',
            icon: Users,
        }
    }

    if (sectionId === 'settings-readiness-rules') {
        return {
            title: 'Readiness Qualification Rules',
            description: 'Discovery requires profile >= 70, readiness score >= 60, and required data-room documents uploaded.',
            badgeVariant: 'warning',
            icon: ClipboardList,
        }
    }

    return {
        title: 'Organization Identity',
        description: 'Update your core profile, logo, location, and categories in one dedicated editor.',
        badgeVariant: 'secondary',
        icon: Building2,
    }
}

export default async function WorkspaceSettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ section?: string | string[]; stripe?: string | string[] }>
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect('/auth/login')
    }

    const user = session.user

    const resolvedSearchParams = await searchParams
    const requestedSection = resolveSingleSearchParam(resolvedSearchParams.section)
    const stripeCheckoutStatus = resolveStripeCheckoutStatus(resolvedSearchParams.stripe)
    const requestedSectionForSnapshot = requestedSection ?? 'settings-identity'

    const [identitySnapshot, provisionalSettingsSnapshot, bootstrapSnapshot] = await Promise.all([
        getWorkspaceIdentityForUser(null as any, user as any),
        getWorkspaceSettingsSnapshotForCurrentUser(null as any, {
            section: requestedSectionForSnapshot,
            userId: user.id,
        }),
        getWorkspaceBootstrapForCurrentUser(null as any, user as any),
    ])

    const { profile, membership } = identitySnapshot
    if (!membership) {
        redirect(getOnboardingPath())
    }

    const cookieStore = await cookies()
    const themeCookie = cookieStore.get('workspace_theme')?.value
    const isLight = themeCookie !== 'dark'

    const canEdit = membership.member_role === 'owner'
    const canManageBilling = membership.member_role === 'owner' || membership.member_role === 'admin'
    const settingsPropertyBlueprint: Omit<SettingsSectionItem, 'href' | 'active'>[] = membership.organization.type === 'startup'
        ? [{ id: 'settings-identity', label: 'Organization Identity', icon: 'identity' }]
        : [
            { id: 'settings-identity', label: 'Organization Identity', icon: 'identity' },
            { id: 'settings-team-access', label: 'Team Access', icon: 'team' },
        ]
    // Allow deep links even if not shown in the Organization settings navigator (e.g. Syndicate → team invites).
    const allowedSectionIds = new Set([...settingsPropertyBlueprint.map((section) => section.id), 'settings-billing', 'settings-invites'])
    const activeSectionId = requestedSection && allowedSectionIds.has(requestedSection)
        ? requestedSection
        : settingsPropertyBlueprint[0]?.id ?? 'settings-identity'
    const settingsProperties: SettingsSectionItem[] = settingsPropertyBlueprint.map((section) => ({
        ...section,
        href: `/workspace/settings?section=${section.id}`,
        active: section.id === activeSectionId,
    }))

    const isStartupOrganization = membership.organization.type === 'startup'
    const shouldLoadPendingInvitesList = canEdit && activeSectionId === 'settings-invites'
    const shouldLoadPendingInvitesCount = canEdit && !shouldLoadPendingInvitesList
    const shouldLoadStartupProfile = isStartupOrganization
        && (
            activeSectionId === 'settings-startup-readiness'
            || activeSectionId === 'settings-discovery'
            || activeSectionId === 'settings-data-room'
        )
    const shouldLoadStartupPost = isStartupOrganization
        && (activeSectionId === 'settings-startup-readiness' || activeSectionId === 'settings-discovery')
    const shouldLoadStartupReadiness = isStartupOrganization
    const shouldLoadDataRoomFeatureGate = isStartupOrganization && activeSectionId === 'settings-data-room'
    const shouldLoadStartupDataRoomDocuments = isStartupOrganization && activeSectionId === 'settings-data-room'
    const shouldLoadBillingPlans = activeSectionId === 'settings-billing' || shouldLoadDataRoomFeatureGate

    const settingsSnapshot =
        activeSectionId === requestedSectionForSnapshot
            ? provisionalSettingsSnapshot
            : await getWorkspaceSettingsSnapshotForCurrentUser(null as any, {
                section: activeSectionId,
                userId: user.id,
            })

    const verificationStatus: OrganizationVerificationStatus =
        settingsSnapshot?.verification_status ?? 'unverified'
    const pendingInvites: OrganizationOutgoingInvite[] = shouldLoadPendingInvitesList
        ? settingsSnapshot?.pending_invites ?? []
        : []
    const pendingInvitesCount = shouldLoadPendingInvitesCount
        ? settingsSnapshot?.pending_invites_count ?? 0
        : 0
    const startupProfile = shouldLoadStartupProfile
        ? settingsSnapshot?.startup_profile ?? null
        : null
    const startupPost = shouldLoadStartupPost
        ? settingsSnapshot?.startup_post ?? null
        : null
    const startupReadiness = shouldLoadStartupReadiness
        ? settingsSnapshot?.startup_readiness ?? null
        : null
    const currentPlan = settingsSnapshot?.current_plan ?? null
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
    const investorThesis = typeof investorProfile?.thesis === 'string'
        ? investorProfile.thesis
        : ''
    const investorSectorTags = Array.isArray(investorProfile?.sector_tags)
        ? investorProfile.sector_tags
            .filter((tag): tag is string => typeof tag === 'string')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
            .join(', ')
        : ''
    const investorCheckSizeMinUsd = normalizeNullableInteger(investorProfile?.check_size_min_usd)
    const investorCheckSizeMaxUsd = normalizeNullableInteger(investorProfile?.check_size_max_usd)
    const billingPlansSnapshot = shouldLoadBillingPlans
        ? await getBillingPlansForCurrentUser(null as any, { segment: membership.organization.type })
        : null
    const billingUsageSnapshot = shouldLoadDataRoomFeatureGate
        ? await getBillingMeForCurrentUser(null as any)
        : null
    const billingPlans: BillingPlan[] = billingPlansSnapshot?.plans ?? []
    const dataRoomDocumentsFeatureGate = shouldLoadDataRoomFeatureGate
        ? resolveDataRoomDocumentsFeatureGate({
            currentPlan: billingUsageSnapshot ?? currentPlan,
            plans: billingPlansSnapshot?.plans ?? [],
            usage: billingUsageSnapshot?.usage ?? [],
        })
        : null
    const startupDataRoomDocuments: StartupDataRoomDocument[] = shouldLoadStartupDataRoomDocuments
        ? await getStartupDataRoomDocumentsForCurrentUser(null as any)
        : []

    const verificationMeta = getVerificationMeta(verificationStatus)
    const billingStripeRedirectEnabled = parseBooleanEnv(
        process.env.BILLING_STRIPE_REDIRECTS_ENABLED
            ?? process.env.NEXT_PUBLIC_BILLING_STRIPE_REDIRECTS_ENABLED,
        true
    )
    const billingSiteUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim())
    const billingApiBaseUrlConfigured = Boolean(process.env.NEXT_PUBLIC_IMPACTIS_API_URL?.trim())
    const hasReadinessData = Boolean(startupReadiness)
    const readinessScore = startupReadiness?.readiness_score ?? null
    const readinessScoreForBar = readinessScore ?? 0
    const readinessStatusVariant: BadgeProps['variant'] = startupReadiness
        ? startupReadiness.eligible_for_discovery_post
            ? 'success'
            : 'warning'
        : 'secondary'
    const readinessStatusLabel = startupReadiness
        ? startupReadiness.eligible_for_discovery_post
            ? 'Eligible'
            : 'Blocked'
        : 'No Data'
    const readinessSectionLabelMap: Record<string, string> = {
        team: 'Team',
        product: 'Product',
        market: 'Market',
        traction: 'Traction',
        financials: 'Financials',
        legal: 'Legal',
        pitch_materials: 'Pitch Materials',
    }

    const industryTags =
        membership.organization.industry_tags.length > 0
            ? membership.organization.industry_tags.join(', ')
            : 'No industry tags set'

    const pageShellClass = isLight
        ? 'bg-slate-50 text-slate-900'
        : 'bg-[#070b14] text-slate-100'
    const panelClass = isLight
        ? 'border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/40'
        : 'border-slate-800 bg-slate-900/70'
    const mutedPanelClass = isLight
        ? 'border-slate-200 bg-slate-50/90'
        : 'border-slate-800 bg-slate-950/70'
    const textMainClass = isLight ? 'text-slate-900' : 'text-slate-100'
    const textMutedClass = isLight ? 'text-slate-500' : 'text-slate-400'
    const titleMutedClass = isLight ? 'text-slate-500' : 'text-slate-400'
    const labelClass = isLight ? 'text-slate-500' : 'text-slate-400'
    const activeSectionPresentation = getSectionPresentation(activeSectionId)
    const isOrganizationEditorSection = activeSectionId === 'settings-identity'
        || activeSectionId === 'settings-startup-readiness'
        || activeSectionId === 'settings-discovery'
    const settingsFormSectionView = activeSectionId === 'settings-startup-readiness'
        ? 'readiness'
        : activeSectionId === 'settings-discovery'
            ? 'discovery'
            : 'identity'

    return (
            <section className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Ambient Light */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                    <div className={`absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full ${isLight ? 'bg-blue-500/5' : 'bg-blue-500/10'} blur-[120px]`} />
                </div>

                {/* Content Body: Scrollable Forms (header provided by workspace layout) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                    <div className="mx-auto max-w-4xl space-y-8">
                        {isOrganizationEditorSection ? (
                            <SettingsForm
                                organizationType={membership.organization.type}
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
                                defaultStartupPostTitle={startupPost?.title ?? ''}
                                defaultStartupPostSummary={startupPost?.summary ?? ''}
                                defaultStartupPostStage={startupPost?.stage ?? ''}
                                defaultStartupPostLocation={startupPost?.location ?? ''}
                                defaultStartupPostIndustryTags={startupPost?.industry_tags.join(', ') ?? ''}
                                defaultStartupPostStatus={startupPost?.status ?? 'draft'}
                                defaultStartupPostNeedAdvisor={startupPost?.need_advisor ?? false}
                                startupReadiness={startupReadiness}
                                sectionView={settingsFormSectionView}
                                canEdit={canEdit}
                                isLight={isLight}
                            />
                        ) : null}

                        {activeSectionId === 'settings-billing' ? (
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
                        ) : null}

                        {activeSectionId === 'settings-invites' ? (
                            <OrganizationInvitesPanel
                                canManage={canEdit}
                                pendingInvites={pendingInvites}
                                isLight={isLight}
                            />
                        ) : null}

                        {activeSectionId === 'settings-permissions' ? (
                            <PermissionsSection
                                organizationType={membership.organization.type}
                                memberRole={membership.member_role}
                                industryTags={industryTags}
                                isLight={isLight}
                                labelClass={labelClass}
                                textMainClass={textMainClass}
                                textMutedClass={textMutedClass}
                                titleMutedClass={titleMutedClass}
                                mutedPanelClass={mutedPanelClass}
                            />
                        ) : null}

                        {activeSectionId === 'settings-team-access' ? (
                            <TeamAccessSection
                                isLight={isLight}
                                labelClass={labelClass}
                                textMainClass={textMainClass}
                                textMutedClass={textMutedClass}
                                titleMutedClass={titleMutedClass}
                                mutedPanelClass={mutedPanelClass}
                            />
                        ) : null}

                        {activeSectionId === 'settings-data-room' && membership.organization.type === 'startup' ? (
                            <DataRoomSection
                                documents={startupDataRoomDocuments}
                                featureGate={dataRoomDocumentsFeatureGate}
                                canEdit={canEdit}
                                isLight={isLight}
                                panelClass={panelClass}
                                mutedPanelClass={mutedPanelClass}
                                textMainClass={textMainClass}
                                textMutedClass={textMutedClass}
                                titleMutedClass={titleMutedClass}
                                labelClass={labelClass}
                            />
                        ) : null}

                        {activeSectionId === 'settings-readiness-rules' && membership.organization.type === 'startup' ? (
                            <ReadinessRulesSection
                                startupReadiness={startupReadiness}
                                readinessSectionLabelMap={readinessSectionLabelMap}
                                isLight={isLight}
                                labelClass={labelClass}
                                textMainClass={textMainClass}
                                textMutedClass={textMutedClass}
                                titleMutedClass={titleMutedClass}
                                mutedPanelClass={mutedPanelClass}
                            />
                        ) : null}
                    </div>
                </div>
            </section>
    )
}
