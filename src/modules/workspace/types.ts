import type {
    OrganizationMembership,
    OrganizationMemberDirectoryEntry,
    OrganizationOutgoingInvite,
    OrganizationVerificationStatus,
} from '@/modules/organizations'
import type {
    StartupPost,
    StartupDiscoveryFeedItem,
    StartupProfile,
    StartupReadiness,
} from '@/modules/startups'
import type { BillingCurrentPlanSnapshot } from '@/modules/billing'
import type { UserProfile } from '@/modules/profiles'

export type WorkspaceSnapshot = {
    verification_status: OrganizationVerificationStatus
    current_plan: BillingCurrentPlanSnapshot | null
    startup_readiness: StartupReadiness | null
}

export type WorkspaceSettingsSnapshot = {
    verification_status: OrganizationVerificationStatus
    current_plan: BillingCurrentPlanSnapshot | null
    pending_invites_count: number
    pending_invites: OrganizationOutgoingInvite[]
    startup_profile: StartupProfile | null
    startup_post: StartupPost | null
    startup_readiness: StartupReadiness | null
}

/** Unified discovery card for all roles (startup, investor, advisor). */
export type UnifiedDiscoveryCard = {
    org_id: string
    org_type: 'startup' | 'investor' | 'advisor'
    name: string
    description: string
    industry_or_expertise: string[]
    stage: string | null
    location: string | null
    image_url: string | null
    id?: string
}

export type WorkspaceDashboardSnapshot = {
    verification_status: OrganizationVerificationStatus
    current_plan: BillingCurrentPlanSnapshot | null
    organization_core_team: OrganizationMemberDirectoryEntry[]
    organization_readiness: WorkspaceOrganizationReadinessSnapshot | null
    startup_discovery_feed: StartupDiscoveryFeedItem[]
    discovery_feed: UnifiedDiscoveryCard[]
    startup_readiness: StartupReadiness | null
}

export type WorkspaceOrganizationReadinessSnapshot = {
    org_id: string
    org_type: 'startup' | 'advisor' | 'investor'
    readiness_score: number
    is_ready: boolean
    missing_steps: string[]
    rules_version: string
    computed_at: string | null
}

export type WorkspaceBootstrapSnapshot = {
    profile: UserProfile
    membership: OrganizationMembership | null
    verification_status: OrganizationVerificationStatus
    current_plan: BillingCurrentPlanSnapshot | null
    organization_core_team: OrganizationMemberDirectoryEntry[]
    organization_readiness: WorkspaceOrganizationReadinessSnapshot | null
    startup_discovery_feed: StartupDiscoveryFeedItem[]
    discovery_feed: UnifiedDiscoveryCard[]
    startup_readiness: StartupReadiness | null
}
