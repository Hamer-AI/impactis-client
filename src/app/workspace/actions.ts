'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { logServerTelemetry } from '@/lib/telemetry/server'
import {
    getOrganizationVerificationStatusByOrgId,
    getPrimaryOrganizationMembershipForUser,
} from '@/modules/organizations'
import { getWorkspaceIdentityForUser } from '@/modules/workspace'
import type { WorkspaceIdentitySnapshot } from '@/modules/workspace'

function normalizeText(value: FormDataEntryValue | null): string | null {
    if (typeof value !== 'string') {
        return null
    }

    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

function normalizeDecision(value: FormDataEntryValue | null): 'accepted' | 'rejected' | null {
    if (typeof value !== 'string') {
        return null
    }

    const normalized = value.trim().toLowerCase()
    if (normalized === 'accepted' || normalized === 'rejected') {
        return normalized
    }

    return null
}

// NOTE: Engagement-related actions were removed because the backend
// `/api/v1/engagements/*` endpoints are not implemented yet. When we
// build that surface from scratch, new actions should be added here.

/**
 * Server action for client-side useQuery: returns workspace identity (profile + membership).
 * Used by TanStack Query for refetch and cache.
 */
export async function getWorkspaceIdentityAction(): Promise<WorkspaceIdentitySnapshot | null> {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    const user = session?.user
    if (!user) {
        return null
    }
    const snapshot = await getWorkspaceIdentityForUser(user as any)
    return snapshot
}
