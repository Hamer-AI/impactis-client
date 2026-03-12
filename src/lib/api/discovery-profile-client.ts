'use client'

import { apiRequest } from '@/lib/api/rest-client'
import { getBetterAuthTokenClient } from '@/lib/better-auth-token-client'
import type { StartupPublicDiscoveryProfile } from '@/modules/startups/types'

/** Client-safe: fetch startup public discovery profile (for use in client components). */
export async function getStartupPublicDiscoveryProfileClient(
    startupOrgId: string
): Promise<StartupPublicDiscoveryProfile | null> {
    const accessToken = await getBetterAuthTokenClient()
    if (!accessToken) return null
    const path = `/startups/discovery/${encodeURIComponent(startupOrgId)}/profile`
    const row = await apiRequest<StartupPublicDiscoveryProfile | null>({
        path,
        method: 'GET',
        accessToken,
    })
    if (!row || typeof row !== 'object') return null
    const r = row as Record<string, unknown>
    return {
        startup_org_id: String(r.startup_org_id ?? ''),
        startup_org_name: String(r.startup_org_name ?? ''),
        startup_logo_url: typeof r.startup_logo_url === 'string' ? r.startup_logo_url : null,
        post: mapPost(r.post),
        profile: mapProfile(r.profile),
        data_room_documents: Array.isArray(r.data_room_documents)
            ? r.data_room_documents.map((d: unknown) => mapDoc(d))
            : [],
    }
}

function mapPost(value: unknown): StartupPublicDiscoveryProfile['post'] {
    const v = value as Record<string, unknown>
    return {
        title: String(v?.title ?? ''),
        summary: String(v?.summary ?? ''),
        stage: typeof v?.stage === 'string' ? v.stage : null,
        location: typeof v?.location === 'string' ? v.location : null,
        industry_tags: Array.isArray(v?.industry_tags) ? v.industry_tags.filter((x): x is string => typeof x === 'string') : [],
        need_advisor: v?.need_advisor === true,
    }
}

function mapProfile(value: unknown): StartupPublicDiscoveryProfile['profile'] {
    const v = value as Record<string, unknown>
    return {
        website_url: typeof v?.website_url === 'string' ? v.website_url : null,
        team_overview: typeof v?.team_overview === 'string' ? v.team_overview : null,
        company_stage: typeof v?.company_stage === 'string' ? v.company_stage : null,
        founding_year: typeof v?.founding_year === 'number' ? v.founding_year : null,
        team_size: typeof v?.team_size === 'number' ? v.team_size : null,
        target_market: typeof v?.target_market === 'string' ? v.target_market : null,
        business_model: typeof v?.business_model === 'string' ? v.business_model : null,
        traction_summary: typeof v?.traction_summary === 'string' ? v.traction_summary : null,
    }
}

function mapDoc(d: unknown): StartupPublicDiscoveryProfile['data_room_documents'][0] {
    const v = d as Record<string, unknown>
    return {
        id: String(v?.id ?? ''),
        document_type: String(v?.document_type ?? ''),
        title: String(v?.title ?? ''),
        file_url: typeof v?.file_url === 'string' ? v.file_url : null,
        file_name: typeof v?.file_name === 'string' ? v.file_name : null,
        summary: typeof v?.summary === 'string' ? v.summary : null,
    }
}
