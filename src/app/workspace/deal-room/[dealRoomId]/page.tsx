'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWorkspaceTheme } from '@/app/workspace/WorkspaceThemeContext'
import { cn } from '@/lib/utils'
import {
    completeDealRoomMilestone,
    createDealRoomAgreement,
    createDealRoomMilestone,
    getDealRoomDetails,
    linkDealRoomDataRoom,
    listDealRoomAgreements,
    listDealRoomMessages,
    listDealRoomMilestones,
    sendDealRoomMessage,
    signDealRoomAgreement,
    updateDealRoomStage,
    type DealRoomAgreementRow,
    type DealRoomMessageView,
    type DealRoomMilestoneRow,
    type DealRoomParticipantView,
    type DealRoomView,
} from '@/modules/deal-room/deal-room.repository'

const STAGES = ['interest', 'due_diligence', 'negotiation', 'commitment', 'closing', 'closed'] as const

export default function DealRoomPage() {
    const { isLight } = useWorkspaceTheme()
    const params = useParams()
    const dealRoomId = typeof params?.dealRoomId === 'string' ? params.dealRoomId : ''

    const [loading, setLoading] = useState(true)
    const [room, setRoom] = useState<DealRoomView | null>(null)
    const [participants, setParticipants] = useState<DealRoomParticipantView[]>([])
    const [messages, setMessages] = useState<DealRoomMessageView[]>([])
    const [messageBody, setMessageBody] = useState('')
    const [sending, setSending] = useState(false)
    const [stageUpdating, setStageUpdating] = useState(false)
    const [agreements, setAgreements] = useState<DealRoomAgreementRow[]>([])
    const [milestones, setMilestones] = useState<DealRoomMilestoneRow[]>([])
    const [agreementTitle, setAgreementTitle] = useState('')
    const [milestoneTitle, setMilestoneTitle] = useState('')
    const [linkStartupOrgId, setLinkStartupOrgId] = useState('')
    const seededDataRoomLink = useRef(false)

    const panelClass = isLight ? 'border-slate-200 bg-white shadow-sm' : 'border-white/10 bg-slate-900/80'
    const textMainClass = isLight ? 'text-slate-900' : 'text-slate-100'
    const textMutedClass = isLight ? 'text-slate-500' : 'text-slate-400'

    const refresh = useCallback(async () => {
        if (!dealRoomId) return
        setLoading(true)
        const [details, msgs, ag, ms] = await Promise.all([
            getDealRoomDetails(dealRoomId),
            listDealRoomMessages(dealRoomId),
            listDealRoomAgreements(dealRoomId),
            listDealRoomMilestones(dealRoomId),
        ])
        if (details && typeof details === 'object' && 'error' in details) {
            toast.error(details.error || 'Failed to load deal room')
            setRoom(null)
            setParticipants([])
        } else {
            setRoom((details as any).room)
            setParticipants((details as any).participants ?? [])
        }
        if (msgs && typeof msgs === 'object' && 'error' in msgs) {
            toast.error(msgs.error || 'Failed to load messages')
            setMessages([])
        } else {
            setMessages(Array.isArray(msgs) ? (msgs as any) : [])
        }
        if (ag && typeof ag === 'object' && 'error' in ag) {
            setAgreements([])
        } else {
            setAgreements(Array.isArray(ag) ? ag : [])
        }
        if (ms && typeof ms === 'object' && 'error' in ms) {
            setMilestones([])
        } else {
            setMilestones(Array.isArray(ms) ? ms : [])
        }
        setLoading(false)
    }, [dealRoomId])

    useEffect(() => {
        refresh()
    }, [refresh])

    const handleSend = useCallback(async () => {
        const body = messageBody.trim()
        if (!body || !dealRoomId) return
        setSending(true)
        const res = await sendDealRoomMessage(dealRoomId, body)
        setSending(false)
        if (res && typeof res === 'object' && 'error' in res) {
            toast.error(res.error || 'Failed to send')
            return
        }
        setMessageBody('')
        setMessages((prev) => [...prev, res as any])
    }, [dealRoomId, messageBody])

    const handleStageChange = useCallback(async (stage: string) => {
        if (!dealRoomId) return
        setStageUpdating(true)
        const res = await updateDealRoomStage(dealRoomId, stage)
        setStageUpdating(false)
        if (res && typeof res === 'object' && 'error' in res) {
            toast.error(res.error || 'Failed to update stage')
            return
        }
        toast.success('Stage updated')
        refresh()
    }, [dealRoomId, refresh])

    const startupOrgIdGuess = useMemo(() => {
        const founder = participants.find((p) => p.role.toLowerCase().includes('startup'))
        return founder?.org_id ?? ''
    }, [participants])

    useEffect(() => {
        if (!seededDataRoomLink.current && startupOrgIdGuess) {
            setLinkStartupOrgId(startupOrgIdGuess)
            seededDataRoomLink.current = true
        }
    }, [startupOrgIdGuess])

    const hasSignedAgreement = useMemo(
        () => agreements.some((a) => a.status === 'signed' || a.status === 'executed'),
        [agreements]
    )

    if (!dealRoomId) {
        return (
            <div className="p-6">
                <p className={textMutedClass}>Invalid deal room.</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <p className={textMutedClass}>Loading deal room…</p>
            </div>
        )
    }

    if (!room) {
        return (
            <div className="p-6 max-w-3xl mx-auto space-y-4">
                <Button type="button" variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/workspace/deal-room">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <p className={textMutedClass}>Deal room not found or you don’t have access.</p>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/workspace/deal-room">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="min-w-0">
                    <h1 className={cn('text-2xl font-black tracking-tight', textMainClass)}>{room.other_org_name}</h1>
                    <p className={cn('text-xs mt-0.5', textMutedClass)}>
                        Stage: {String(room.stage).replace(/_/g, ' ')}
                    </p>
                </div>
            </div>

            <div className={cn('rounded-2xl border p-4', panelClass)}>
                <p className={cn('text-sm font-black uppercase tracking-widest', textMutedClass)}>Deal lifecycle (v3)</p>
                <ul className={cn('mt-2 list-inside list-disc space-y-1 text-sm', textMainClass)}>
                    <li>After alignment in chat, record an agreement and sign it.</li>
                    <li>Move stage to <strong>due diligence</strong> when you begin formal DD (unlocks Data Room workflow per platform rules).</li>
                    <li>
                        Investors (Elite): request Data Room access from the startup — open{' '}
                        <Link className="text-emerald-600 underline hover:text-emerald-700" href="/workspace/data-room">
                            Data Room
                        </Link>
                        .
                    </li>
                    <li>Track checkpoints with milestones; close the deal by setting stage to closed when finished.</li>
                </ul>
                {hasSignedAgreement && room.stage === 'interest' ? (
                    <p className={cn('mt-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100')}>
                        Agreement signed — consider advancing the stage to <strong>due diligence</strong> using the panel on the right, then proceed with Data Room access if applicable.
                    </p>
                ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className={cn('rounded-2xl border p-4 md:col-span-2', panelClass)}>
                    <div className="flex items-center justify-between">
                        <p className={cn('text-sm font-black uppercase tracking-widest', textMutedClass)}>Discussion</p>
                    </div>
                    <div className="mt-3 h-[420px] overflow-y-auto space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-white/10 dark:bg-slate-950/40">
                        {messages.length === 0 ? (
                            <p className={textMutedClass}>No messages yet.</p>
                        ) : (
                            messages.map((m) => (
                                <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900/60">
                                    <p className={cn('text-xs font-bold', textMutedClass)}>{m.sender_email ?? m.sender_user_id}</p>
                                    <p className={cn('mt-1', textMainClass)}>{m.body}</p>
                                    <p className={cn('mt-1 text-[11px]', textMutedClass)}>{new Date(m.created_at).toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Input
                            value={messageBody}
                            onChange={(e) => setMessageBody(e.target.value)}
                            placeholder="Message…"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                        />
                        <Button type="button" onClick={handleSend} disabled={sending || messageBody.trim().length === 0} className="rounded-xl gap-2">
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Send
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className={cn('rounded-2xl border p-4', panelClass)}>
                        <p className={cn('text-sm font-black uppercase tracking-widest', textMutedClass)}>Participants</p>
                        <ul className="mt-3 space-y-2">
                            {participants.map((p) => (
                                <li key={p.id} className={cn('rounded-xl border p-3', isLight ? 'border-slate-200 bg-slate-50/70' : 'border-white/10 bg-slate-950/40')}>
                                    <p className={cn('font-bold', textMainClass)}>{p.org_name}</p>
                                    <p className={cn('text-xs', textMutedClass)}>{p.role.replace(/_/g, ' ')}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={cn('rounded-2xl border p-4', panelClass)}>
                        <p className={cn('text-sm font-black uppercase tracking-widest', textMutedClass)}>Deal Stage</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {STAGES.map((s) => (
                                <Button
                                    key={s}
                                    type="button"
                                    size="sm"
                                    variant={room.stage === s ? 'default' : 'outline'}
                                    className="rounded-lg justify-start"
                                    disabled={stageUpdating}
                                    onClick={() => handleStageChange(s)}
                                >
                                    {String(s).replace(/_/g, ' ')}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className={cn('rounded-2xl border p-4', panelClass)}>
                        <p className={cn('text-sm font-black uppercase tracking-widest', textMutedClass)}>Agreements</p>
                        <div className="mt-2 flex gap-2">
                            <Input
                                value={agreementTitle}
                                onChange={(e) => setAgreementTitle(e.target.value)}
                                placeholder="New agreement title"
                                className="rounded-lg"
                            />
                            <Button
                                type="button"
                                size="sm"
                                className="shrink-0 rounded-lg bg-emerald-600 text-white"
                                onClick={async () => {
                                    const t = agreementTitle.trim()
                                    if (!t) return
                                    const res = await createDealRoomAgreement(dealRoomId, t)
                                    if (res && 'error' in res) toast.error(res.error)
                                    else {
                                        toast.success('Agreement created')
                                        setAgreementTitle('')
                                        refresh()
                                    }
                                }}
                            >
                                Add
                            </Button>
                        </div>
                        <ul className="mt-3 space-y-2">
                            {agreements.length === 0 ? (
                                <li className={cn('text-sm', textMutedClass)}>No agreements yet.</li>
                            ) : (
                                agreements.map((a) => (
                                    <li
                                        key={a.id}
                                        className={cn('flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 text-sm', isLight ? 'border-slate-200' : 'border-white/10')}
                                    >
                                        <span className={textMainClass}>
                                            {a.title}{' '}
                                            <span className={cn('text-xs uppercase', textMutedClass)}>({a.status})</span>
                                        </span>
                                        {a.status === 'draft' || a.status === 'review' ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="rounded-md"
                                                onClick={async () => {
                                                    const res = await signDealRoomAgreement(dealRoomId, a.id)
                                                    if (res && 'error' in res) toast.error(res.error)
                                                    else {
                                                        toast.success('Signed')
                                                        refresh()
                                                    }
                                                }}
                                            >
                                                Sign
                                            </Button>
                                        ) : null}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <div className={cn('rounded-2xl border p-4', panelClass)}>
                        <p className={cn('text-sm font-black uppercase tracking-widest', textMutedClass)}>Milestones</p>
                        <div className="mt-2 flex gap-2">
                            <Input
                                value={milestoneTitle}
                                onChange={(e) => setMilestoneTitle(e.target.value)}
                                placeholder="Milestone title"
                                className="rounded-lg"
                            />
                            <Button
                                type="button"
                                size="sm"
                                className="shrink-0 rounded-lg bg-emerald-600 text-white"
                                onClick={async () => {
                                    const t = milestoneTitle.trim()
                                    if (!t) return
                                    const res = await createDealRoomMilestone(dealRoomId, t)
                                    if (res && 'error' in res) toast.error(res.error)
                                    else {
                                        toast.success('Milestone added')
                                        setMilestoneTitle('')
                                        refresh()
                                    }
                                }}
                            >
                                Add
                            </Button>
                        </div>
                        <ul className="mt-3 space-y-2">
                            {milestones.length === 0 ? (
                                <li className={cn('text-sm', textMutedClass)}>No milestones yet.</li>
                            ) : (
                                milestones.map((m) => (
                                    <li
                                        key={m.id}
                                        className={cn('flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2 text-sm', isLight ? 'border-slate-200' : 'border-white/10')}
                                    >
                                        <span className={textMainClass}>
                                            {m.title}
                                            {m.completed_at ? (
                                                <span className={cn('ml-2 text-xs text-emerald-600')}>Done</span>
                                            ) : null}
                                        </span>
                                        {!m.completed_at ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="rounded-md"
                                                onClick={async () => {
                                                    const res = await completeDealRoomMilestone(dealRoomId, m.id)
                                                    if (res && 'error' in res) toast.error(res.error)
                                                    else {
                                                        toast.success('Marked complete')
                                                        refresh()
                                                    }
                                                }}
                                            >
                                                Complete
                                            </Button>
                                        ) : null}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <div className={cn('rounded-2xl border p-4', panelClass)}>
                        <p className={cn('text-sm font-black uppercase tracking-widest', textMutedClass)}>Data room link</p>
                        <p className={cn('mt-1 text-xs', textMutedClass)}>
                            Associate this deal with the startup&apos;s org UUID for the Data Room workflow (MD: DD stage → access requests).
                        </p>
                        <Input
                            className="mt-2 rounded-lg font-mono text-xs"
                            value={linkStartupOrgId}
                            onChange={(e) => setLinkStartupOrgId(e.target.value)}
                            placeholder="Startup organization UUID"
                        />
                        <Button
                            type="button"
                            size="sm"
                            className="mt-2 w-full rounded-lg bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-700"
                            onClick={async () => {
                                const id = linkStartupOrgId.trim()
                                if (!id) {
                                    toast.error('Startup org UUID required')
                                    return
                                }
                                const res = await linkDealRoomDataRoom(dealRoomId, id)
                                if (res && 'error' in res) toast.error(res.error)
                                else {
                                    toast.success('Data room linked on deal')
                                }
                            }}
                        >
                            Save link
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

