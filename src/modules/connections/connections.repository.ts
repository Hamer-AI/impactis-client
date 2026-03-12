import { apiRequest } from '@/lib/api/rest-client'
import { getBetterAuthTokenClient } from '@/lib/better-auth-token-client'

export type ConnectionRequestView = {
    id: string
    from_org_id: string
    from_org_name: string
    to_org_id: string
    to_org_name: string
    status: 'pending' | 'accepted' | 'rejected'
    message: string | null
    created_at: string
    responded_at: string | null
}

export type ConnectionView = {
    id: string
    org_a_id: string
    org_b_id: string
    other_org_id: string
    other_org_name: string
    created_at: string
}

export type ConnectionMessageView = {
    id: string
    connection_id: string
    from_org_id: string
    from_org_name: string
    body: string
    created_at: string
}

async function getAccessToken(): Promise<string | null> {
    return getBetterAuthTokenClient()
}

export async function listIncomingConnectionRequests(): Promise<ConnectionRequestView[]> {
    const token = await getAccessToken()
    if (!token) return []
    const data = await apiRequest<ConnectionRequestView[]>({
        path: '/connections/requests/incoming',
        method: 'GET',
        accessToken: token,
    })
    return Array.isArray(data) ? data : []
}

export async function listOutgoingConnectionRequests(): Promise<ConnectionRequestView[]> {
    const token = await getAccessToken()
    if (!token) return []
    const data = await apiRequest<ConnectionRequestView[]>({
        path: '/connections/requests/outgoing',
        method: 'GET',
        accessToken: token,
    })
    return Array.isArray(data) ? data : []
}

export async function getPendingConnectionCount(): Promise<number> {
    const token = await getAccessToken()
    if (!token) return 0
    const data = await apiRequest<{ count: number }>({
        path: '/connections/pending-count',
        method: 'GET',
        accessToken: token,
    })
    return typeof data?.count === 'number' ? data.count : 0
}

export async function createConnectionRequest(params: {
    toOrgId: string
    message?: string | null
}): Promise<ConnectionRequestView | { error: string }> {
    const token = await getAccessToken()
    if (!token) return { error: 'Unauthorized' }
    const result = await apiRequest<ConnectionRequestView | { error: string }>({
        path: '/connections/requests',
        method: 'POST',
        accessToken: token,
        body: { toOrgId: params.toOrgId, message: params.message ?? null },
    })
    return result ?? { error: 'Failed to send request' }
}

export async function acceptConnectionRequest(
    requestId: string
): Promise<ConnectionView | { error: string }> {
    const token = await getAccessToken()
    if (!token) return { error: 'Unauthorized' }
    const result = await apiRequest<ConnectionView | { error: string }>({
        path: `/connections/requests/${encodeURIComponent(requestId)}/accept`,
        method: 'POST',
        accessToken: token,
    })
    return result ?? { error: 'Failed to accept' }
}

export async function rejectConnectionRequest(
    requestId: string
): Promise<{ success: boolean } | { error: string }> {
    const token = await getAccessToken()
    if (!token) return { error: 'Unauthorized' }
    const result = await apiRequest<{ success: boolean } | { error: string }>({
        path: `/connections/requests/${encodeURIComponent(requestId)}/reject`,
        method: 'POST',
        accessToken: token,
    })
    return result ?? { error: 'Failed to reject' }
}

export async function listConnections(): Promise<ConnectionView[]> {
    const token = await getAccessToken()
    if (!token) return []
    const data = await apiRequest<ConnectionView[]>({
        path: '/connections',
        method: 'GET',
        accessToken: token,
    })
    return Array.isArray(data) ? data : []
}

export async function listConnectionMessages(
    connectionId: string
): Promise<ConnectionMessageView[] | { error: string }> {
    const token = await getAccessToken()
    if (!token) return { error: 'Unauthorized' }
    const data = await apiRequest<ConnectionMessageView[] | { error: string }>({
        path: `/connections/${encodeURIComponent(connectionId)}/messages`,
        method: 'GET',
        accessToken: token,
    })
    if (data && typeof data === 'object' && 'error' in data) return data as { error: string }
    return Array.isArray(data) ? data : []
}

export async function sendConnectionMessage(
    connectionId: string,
    body: string
): Promise<ConnectionMessageView | { error: string }> {
    const token = await getAccessToken()
    if (!token) return { error: 'Unauthorized' }
    const result = await apiRequest<ConnectionMessageView | { error: string }>({
        path: `/connections/${encodeURIComponent(connectionId)}/messages`,
        method: 'POST',
        accessToken: token,
        body: { body },
    })
    return result ?? { error: 'Failed to send message' }
}
