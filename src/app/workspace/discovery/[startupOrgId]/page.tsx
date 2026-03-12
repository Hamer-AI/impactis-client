'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, FileText, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStartupPublicDiscoveryProfileClient } from '@/lib/api/discovery-profile-client'
import {
    createConnectionRequest,
    listOutgoingConnectionRequests,
} from '@/modules/connections/connections.repository'
import type { StartupPublicDiscoveryProfile } from '@/modules/startups/types'
import { cn } from '@/lib/utils'

export default function DiscoveryStartupProfilePage() {
    const params = useParams()
    const router = useRouter()
    const startupOrgId = typeof params?.startupOrgId === 'string' ? params.startupOrgId : ''
    const [profile, setProfile] = useState<StartupPublicDiscoveryProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [connectState, setConnectState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
    const [outgoingToThis, setOutgoingToThis] = useState(false)

    useEffect(() => {
        if (!startupOrgId) {
            setLoading(false)
            return
        }
        let cancelled = false
        setLoading(true)
        getStartupPublicDiscoveryProfileClient(startupOrgId)
            .then((data) => {
                if (!cancelled) setProfile(data ?? null)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [startupOrgId])

    useEffect(() => {
        if (!startupOrgId || !profile) return
        listOutgoingConnectionRequests().then((list) => {
            const has = list.some((r) => r.to_org_id === startupOrgId && r.status === 'pending')
            setOutgoingToThis(has)
        })
    }, [startupOrgId, profile])

    const handleRequestConnect = useCallback(() => {
        if (!startupOrgId || connectState !== 'idle') return
        setConnectState('sending')
        createConnectionRequest({ toOrgId: startupOrgId })
            .then((result) => {
                if ('error' in result) {
                    setConnectState('error')
                } else {
                    setConnectState('sent')
                    setOutgoingToThis(true)
                }
            })
            .catch(() => setConnectState('error'))
    }, [startupOrgId, connectState])

    if (!startupOrgId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-slate-500">Invalid startup</p>
                <Button asChild variant="outline"><Link href="/workspace">Back to Workspace</Link></Button>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <p className="text-slate-500">Loading profile…</p>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-slate-500">Startup not found or not published</p>
                <Button asChild variant="outline"><Link href="/workspace">Back to Workspace</Link></Button>
            </div>
        )
    }

    const { post, profile: bio, data_room_documents } = profile

    return (
        <div className="space-y-8 p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/workspace"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                    {profile.startup_org_name}
                </h1>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Discovery post
                </h2>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{post.title}</p>
                <p className="text-slate-600 dark:text-slate-300">{post.summary}</p>
                <div className="flex flex-wrap gap-2">
                    {post.stage && (
                        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                            {post.stage}
                        </span>
                    )}
                    {post.location && (
                        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                            {post.location}
                        </span>
                    )}
                    {post.industry_tags.slice(0, 5).map((tag) => (
                        <span
                            key={tag}
                            className="rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 text-xs font-bold"
                        >
                            #{tag}
                        </span>
                    ))}
                    {post.need_advisor && (
                        <span className="rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 text-xs font-bold">
                            Seeking advisor
                        </span>
                    )}
                </div>
            </div>

            {(bio.team_overview || bio.business_model || bio.traction_summary) && (
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Bio &amp; traction
                    </h2>
                    {bio.team_overview && (
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Team</p>
                            <p className="text-slate-700 dark:text-slate-300">{bio.team_overview}</p>
                        </div>
                    )}
                    {bio.business_model && (
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Business model</p>
                            <p className="text-slate-700 dark:text-slate-300">{bio.business_model}</p>
                        </div>
                    )}
                    {bio.traction_summary && (
                        <div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Traction</p>
                            <p className="text-slate-700 dark:text-slate-300">{bio.traction_summary}</p>
                        </div>
                    )}
                </div>
            )}

            {data_room_documents.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-6 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Data room
                    </h2>
                    <ul className="space-y-2">
                        {data_room_documents.map((doc) => (
                            <li key={doc.id}>
                                {doc.file_url ? (
                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                    >
                                        <FileText className="h-4 w-4" />
                                        {doc.title}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                ) : (
                                    <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                        <FileText className="h-4 w-4" />
                                        {doc.title} (no file)
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
                {outgoingToThis || connectState === 'sent' ? (
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Connection request sent. The startup will be notified.
                    </p>
                ) : (
                    <Button
                        onClick={handleRequestConnect}
                        disabled={connectState === 'sending'}
                        className="gap-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    >
                        {connectState === 'sending' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Request to connect
                    </Button>
                )}
                {connectState === 'error' && (
                    <p className="text-sm text-rose-500">Could not send request. Try again.</p>
                )}
                <Button variant="outline" asChild className="rounded-xl">
                    <Link href="/workspace">Back to Discovery</Link>
                </Button>
            </div>
        </div>
    )
}
