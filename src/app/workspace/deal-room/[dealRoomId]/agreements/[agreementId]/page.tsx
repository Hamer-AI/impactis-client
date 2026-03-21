'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, FileSignature } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspaceTheme } from '@/app/workspace/WorkspaceThemeContext'
import { cn } from '@/lib/utils'
import {
    getDealRoomAgreement,
    signDealRoomAgreement,
    type DealRoomAgreementDetail,
} from '@/modules/deal-room/deal-room.repository'

export default function AgreementReceiptPage() {
    const { isLight } = useWorkspaceTheme()
    const params = useParams()
    const dealRoomId = typeof params?.dealRoomId === 'string' ? params.dealRoomId : ''
    const agreementId = typeof params?.agreementId === 'string' ? params.agreementId : ''

    const [loading, setLoading] = useState(true)
    const [agreement, setAgreement] = useState<DealRoomAgreementDetail | null>(null)
    const [signing, setSigning] = useState(false)

    const fetchAgreement = useCallback(async () => {
        if (!dealRoomId || !agreementId) return
        setLoading(true)
        const res = await getDealRoomAgreement(dealRoomId, agreementId)
        if (res && 'error' in res) {
            toast.error(res.error)
        } else {
            setAgreement(res as DealRoomAgreementDetail)
        }
        setLoading(false)
    }, [dealRoomId, agreementId])

    useEffect(() => {
        fetchAgreement()
    }, [fetchAgreement])

    const handleSign = async () => {
        if (!dealRoomId || !agreementId) return
        setSigning(true)
        const res = await signDealRoomAgreement(dealRoomId, agreementId)
        if (res && 'error' in res) {
            toast.error(res.error)
            setSigning(false)
        } else {
            toast.success('Agreement successfully signed!')
            await fetchAgreement()
            setSigning(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className={isLight ? 'text-slate-500' : 'text-slate-400'}>Loading agreement document…</p>
            </div>
        )
    }

    if (!agreement) {
        return (
            <div className="p-6 max-w-3xl mx-auto space-y-4">
                <Button type="button" variant="ghost" asChild className="rounded-xl">
                    <Link href={`/workspace/deal-room/${dealRoomId}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Deal Room
                    </Link>
                </Button>
                <div className="p-8 text-center text-rose-500 font-bold bg-rose-50 rounded-xl">
                    Agreement not found or access denied.
                </div>
            </div>
        )
    }

    const textMainClass = isLight ? 'text-slate-900' : 'text-slate-100'
    const textMutedClass = isLight ? 'text-slate-500' : 'text-slate-400'
    const receiptBgClass = isLight ? 'bg-white border-slate-200 shadow-xl' : 'bg-slate-900 border-slate-700 shadow-2xl ring-1 ring-white/10'

    const signersList = Array.isArray(agreement.signed_by) ? agreement.signed_by : []
    const isSigned = agreement.status === 'signed' || signersList.length > 0

    return (
        <div className="min-h-screen py-10 px-4 flex flex-col items-center">
            <div className="w-full max-w-4xl flex justify-start mb-6">
                <Button type="button" variant="ghost" asChild className={cn("rounded-xl font-bold hover:bg-transparent", textMutedClass)}>
                    <Link href={`/workspace/deal-room/${dealRoomId}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Return to Deal Room
                    </Link>
                </Button>
            </div>

            {/* Receipt Modal Container */}
            <div className={cn("w-full max-w-3xl rounded-none md:rounded-lg p-8 md:p-14 transition-all", receiptBgClass)}>
                
                <div className="flex justify-between items-start border-b pb-8 mb-8 border-slate-200 dark:border-slate-800">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full dark:bg-indigo-500/10 dark:text-indigo-400">
                                <FileSignature className="h-6 w-6" />
                            </div>
                            <h1 className={cn("text-3xl font-serif text-slate-800 dark:text-slate-200 font-bold leading-tight")}>
                                {agreement.title}
                            </h1>
                        </div>
                        <p className={cn("text-sm font-mono mt-2 uppercase tracking-widest", textMutedClass)}>
                            Ref ID: {agreement.id.split('-')[0]}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={cn(
                            "inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border",
                            isSigned 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                                : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                        )}>
                            {agreement.status}
                        </span>
                        <p className={cn("text-xs font-mono mt-3", textMutedClass)}>
                            {new Date(agreement.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Content Body */}
                <div className={cn("prose prose-sm md:prose-base max-w-none font-serif leading-loose min-h-[300px]", textMainClass)}>
                    {agreement.content_text ? (
                        <div className="whitespace-pre-wrap">{agreement.content_text}</div>
                    ) : (
                        <p className="italic opacity-60">
                            {agreement.template_key 
                                ? `[Standard System Template: ${agreement.template_key}] Attached definitions and covenants apply to all referenced organizations automatically upon signature.` 
                                : `This document serves as a binding digital agreement between configured syndicates.`}
                        </p>
                    )}
                </div>

                {/* Signatures & Footer */}
                <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <h4 className={cn("text-sm font-black tracking-widest uppercase mb-6", textMutedClass)}>Signatures</h4>
                    
                    {signersList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            {signersList.map((signer: any, idx: number) => (
                                <div key={idx} className={cn("p-4 rounded-xl border bg-slate-50 dark:bg-black/20 dark:border-white/5", textMainClass)}>
                                    <p className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Signed</p>
                                    <p className="text-sm font-mono">{new Date(signer.signed_at).toLocaleString()}</p>
                                    <p className="text-xs opacity-60 mt-1">Org ID: {String(signer.org_id).split('-')[0]}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={cn("text-sm font-mono italic mb-10", textMutedClass)}>No signatures recorded yet.</p>
                    )}

                    {!isSigned ? (
                        <div className="flex justify-center mt-8">
                            <Button 
                                onClick={handleSign} 
                                disabled={signing} 
                                className="w-full md:w-auto px-12 h-14 rounded-full text-base font-bold shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 transition-all"
                            >
                                {signing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <FileSignature className="h-5 w-5 mr-2" />}
                                Sign Agreement
                            </Button>
                        </div>
                    ) : (
                         <div className="flex justify-center mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                             <p className="font-bold text-center">✓ This agreement has been executed and is now in effect.</p>
                         </div>
                    )}
                </div>

            </div>
        </div>
    )
}
