import { apiRequest } from '@/lib/api/rest-client'
import { getBetterAuthTokenClient } from '@/lib/better-auth-token-client'

export type NotificationView = {
    id: string
    type: string
    title: string
    body: string | null
    link: string | null
    read_at: string | null
    created_at: string
}

async function getAccessToken(): Promise<string | null> {
    return getBetterAuthTokenClient()
}

export async function listNotifications(): Promise<NotificationView[]> {
    const token = await getAccessToken()
    if (!token) return []
    const data = await apiRequest<NotificationView[]>({
        path: '/notifications',
        method: 'GET',
        accessToken: token,
    })
    if (!Array.isArray(data)) return []
    return data.map((n) => ({
        id: String(n.id),
        type: String(n.type),
        title: String(n.title),
        body: n.body != null ? String(n.body) : null,
        link: n.link != null ? String(n.link) : null,
        read_at: n.read_at != null ? String(n.read_at) : null,
        created_at: String(n.created_at),
    }))
}

export async function getNotificationsUnreadCount(): Promise<number> {
    const token = await getAccessToken()
    if (!token) return 0
    const data = await apiRequest<{ count: number }>({
        path: '/notifications/unread-count',
        method: 'GET',
        accessToken: token,
    })
    return typeof data?.count === 'number' ? data.count : 0
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
    const token = await getAccessToken()
    if (!token) return false
    const data = await apiRequest<{ success: boolean }>({
        path: `/notifications/${encodeURIComponent(notificationId)}/read`,
        method: 'PATCH',
        accessToken: token,
    })
    return data?.success === true
}
