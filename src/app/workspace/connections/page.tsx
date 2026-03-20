'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, MessageCircle, Send, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    listIncomingConnectionRequests,
    listOutgoingConnectionRequests,
    listConnections,
    acceptConnectionRequest,
    rejectConnectionRequest,
} from '@/modules/connections/connections.repository'
import type { ConnectionRequestView, ConnectionView } from '@/modules/connections/connections.repository'
import { useWorkspaceTheme } from '@/app/workspace/WorkspaceThemeContext'
import { cn } from '@/lib/utils'

export default function WorkspaceConnectionsPage() {
    const { isLight } = useWorkspaceTheme()
    const [incoming, setIncoming] = useState<ConnectionRequestView[]>([])
    const [outgoing, setOutgoing] = useState<ConnectionRequestView[]>([])
    const [connections, setConnections] = useState<ConnectionView[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(() => {
        setLoading(true)
        Promise.all([
            listIncomingConnectionRequests(),
            listOutgoingConnectionRequests(),
            listConnections(),
        ]).then(([inc, out, conn]) => {
            setIncoming(inc)
            setOutgoing(out)
            setConnections(conn)
        }).finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const handleAccept = useCallback((id: string) => {
        acceptConnectionRequest(id)
            .then((result) => {
                if (result && !('error' in result)) {
                    toast.success('Connection accepted', {
                        description: 'You can now message from Deal Room.',
                    })
                }
                refresh()
            })
            .catch(() => {
                toast.error('Failed to accept')
                refresh()
            })
    }, [refresh])

    const handleReject = useCallback((id: string) => {
        rejectConnectionRequest(id)
            .then(() => {
                toast.success('Request declined')
                refresh()
            })
            .catch(() => {
                toast.error('Failed to decline')
                refresh()
            })
    }, [refresh])

    const panelClass = isLight
        ? 'border-slate-200 bg-white shadow-sm'
        : 'border-white/5 bg-slate-900/80'
    const textMainClass = isLight ? 'text-slate-900' : 'text-slate-100'
    const textMutedClass = isLight ? 'text-slate-500' : 'text-slate-400'

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <p className={textMutedClass}>Loading connections…</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 p-6 max-w-3xl mx-auto">
            <div>
                <h1 className={cn('text-2xl font-black tracking-tight', textMainClass)}>
                    Connections
                </h1>
                <p className={cn('text-sm mt-1', textMutedClass)}>
                    Manage connection requests and message your connections.
                </p>
            </div>

            {incoming.length > 0 && (
                <div className={cn('rounded-2xl border p-6', panelClass)}>
                    <h2 className={cn('text-sm font-black uppercase tracking-widest', textMutedClass)}>
                        Incoming requests
                    </h2>
                    <ul className="mt-4 space-y-3">
                        {incoming.map((req) => (
                            <li
                                key={req.id}
                                className={cn(
                                    'flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4',
                                    isLight ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-slate-950/40'
                                )}
                            >
                                <div>
                                    <p className={cn('font-bold', textMainClass)}>{req.from_org_name}</p>
                                    {req.message && (
                                        <p className={cn('text-sm mt-1', textMutedClass)}>{req.message}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="default"
                                        className="gap-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                        onClick={() => handleAccept(req.id)}
                                    >
                                        <UserCheck className="h-3.5 w-3.5" />
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1.5 rounded-lg"
                                        onClick={() => handleReject(req.id)}
                                    >
                                        <UserX className="h-3.5 w-3.5" />
                                        Decline
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {outgoing.length > 0 && (
                <div className={cn('rounded-2xl border p-6', panelClass)}>
                    <h2 className={cn('text-sm font-black uppercase tracking-widest', textMutedClass)}>
                        Sent requests
                    </h2>
                    <ul className="mt-4 space-y-2">
                        {outgoing.map((req) => (
                            <li
                                key={req.id}
                                className={cn(
                                    'flex items-center justify-between rounded-xl border p-3',
                                    isLight ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-slate-950/40'
                                )}
                            >
                                <span className={cn('font-medium', textMainClass)}>{req.to_org_name}</span>
                                <span className={cn('text-xs font-bold uppercase', textMutedClass)}>
                                    {req.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className={cn('rounded-2xl border p-6', panelClass)}>
                <h2 className={cn('text-sm font-black uppercase tracking-widest', textMutedClass)}>
                    Your connections
                </h2>
                {connections.length === 0 ? (
                    <p className={cn('mt-4 text-sm', textMutedClass)}>
                        No connections yet. When investors or advisors request to connect and you accept, they’ll appear here. You can message each other from this page.
                    </p>
                ) : (
                    <ul className="mt-4 space-y-2">
                        {connections.map((c) => (
                            <li
                                key={c.id}
                                className={cn(
                                    'flex items-center justify-between rounded-xl border p-3',
                                    isLight ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-slate-950/40'
                                )}
                            >
                                <span className={cn('font-medium', textMainClass)}>{c.other_org_name}</span>
                                <Button asChild variant="ghost" size="sm" className="gap-1.5 rounded-lg">
                                    <Link
                                        href={
                                            c.deal_room_id
                                                ? `/workspace/deal-room/${encodeURIComponent(c.deal_room_id)}`
                                                : `/workspace/connections/${encodeURIComponent(c.id)}`
                                        }
                                    >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        Message
                                    </Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
