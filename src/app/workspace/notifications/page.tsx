'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    listNotifications,
    markNotificationRead,
    type NotificationView,
} from '@/modules/notifications/notifications.repository'
import { useWorkspaceTheme } from '@/app/workspace/WorkspaceThemeContext'
import { cn } from '@/lib/utils'

function formatRelative(dateStr: string): string {
    const d = new Date(dateStr)
    const now = Date.now()
    const diff = now - d.getTime()
    if (diff < 60_000) return 'Just now'
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`
    if (diff < 604800_000) return `${Math.floor(diff / 86400_000)}d ago`
    return d.toLocaleDateString()
}

export default function WorkspaceNotificationsPage() {
    const { isLight } = useWorkspaceTheme()
    const [list, setList] = useState<NotificationView[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(() => {
        setLoading(true)
        listNotifications()
            .then(setList)
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const handleMarkRead = useCallback(
        (id: string) => {
            markNotificationRead(id).then((ok) => {
                if (ok) setList((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)))
            })
        },
        []
    )

    const panelClass = isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-900/80'
    const textMainClass = isLight ? 'text-slate-900' : 'text-slate-100'
    const textMutedClass = isLight ? 'text-slate-500' : 'text-slate-400'

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/workspace">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className={cn('text-2xl font-black tracking-tight', textMainClass)}>
                        Notifications
                    </h1>
                    <p className={cn('text-sm mt-0.5', textMutedClass)}>
                        Connection requests, acceptances, and deal room updates.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    <p className={textMutedClass}>Loading…</p>
                </div>
            ) : list.length === 0 ? (
                <div className={cn('rounded-2xl border p-8 text-center', panelClass)}>
                    <Bell className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                    <p className={cn('mt-3 font-semibold', textMainClass)}>No notifications yet</p>
                    <p className={cn('mt-1 text-sm', textMutedClass)}>
                        When you receive connection requests or acceptances, they’ll appear here.
                    </p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {list.map((n) => (
                        <li
                            key={n.id}
                            className={cn(
                                'rounded-xl border p-4 transition-colors',
                                panelClass,
                                !n.read_at && (isLight ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-emerald-500/5 border-emerald-500/20')
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    {n.link ? (
                                        <a
                                            href={n.link}
                                            className={cn('font-bold hover:underline', textMainClass)}
                                        >
                                            {n.title}
                                        </a>
                                    ) : (
                                        <span className={cn('font-bold', textMainClass)}>{n.title}</span>
                                    )}
                                    {n.body && (
                                        <p className={cn('mt-0.5 text-sm', textMutedClass)}>{n.body}</p>
                                    )}
                                    <p className={cn('mt-1 text-xs', textMutedClass)}>{formatRelative(n.created_at)}</p>
                                </div>
                                {!n.read_at && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="shrink-0 gap-1 rounded-lg"
                                        onClick={() => handleMarkRead(n.id)}
                                        title="Mark as read"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        Read
                                    </Button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
