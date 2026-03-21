'use client'

import { useWorkspaceTheme } from '@/app/workspace/WorkspaceThemeContext'
import { cn } from '@/lib/utils'
import { Network, Crown, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import SyndicateList from '@/components/syndicates/syndicate-list'
import Link from 'next/link'

export default function SyndicatePage({
    planCode
}: {
    planCode: 'free' | 'pro' | 'elite'
}) {
    const { isLight } = useWorkspaceTheme()
    const isElite = planCode === 'elite'

    const textMain = isLight ? 'text-slate-900' : 'text-slate-100'
    const textMuted = isLight ? 'text-slate-500' : 'text-slate-400'
    const panel = isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-900/60'

    return (
        <section className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                <div className="mx-auto max-w-5xl space-y-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <Network className={cn('h-8 w-8', isLight ? 'text-emerald-600' : 'text-emerald-400')} />
                            <h1 className={cn('text-3xl font-black tracking-tight', textMain)}>Syndicate Access</h1>
                        </div>
                        <p className={cn('text-sm md:text-base max-w-2xl', textMuted)}>
                            Pool resources with other investors. Form syndicates, establish SPVs, and capture
                            opportunities usually reserved for major institutions.
                        </p>
                    </div>

                    <div className="relative">
                        {!isElite && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-slate-950/20 backdrop-blur-sm p-6 text-center">
                                <Card className={cn('max-w-md w-full border-emerald-500/20 shadow-xl', isLight ? 'bg-white/95' : 'bg-slate-900/95')}>
                                    <CardHeader className="text-center pb-2">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                                            <Crown className="h-6 w-6 text-emerald-500" />
                                        </div>
                                        <CardTitle className="text-xl font-black tracking-tight">Elite Feature</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            The Syndicate feature is reserved for Elite tier accounts. 
                                            Upgrade today to unlock the ability to create SPVs and manage deal room syndicates.
                                        </p>
                                        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                                            <Link href="/workspace/subscription">Upgrade to Elite</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <div className={cn('transition-all', !isElite ? 'blur-sm pointer-events-none select-none opacity-50' : '')}>
                            <div className="grid gap-6">
                                <div className="flex justify-between items-center bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20">
                                    <div>
                                        <h3 className={cn('font-bold text-lg', textMain)}>Active Syndicates</h3>
                                        <p className={cn('text-sm', textMuted)}>Manage your existing syndicates or form a new one.</p>
                                    </div>
                                    <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                                        Form Syndicate
                                    </Button>
                                </div>
                                <SyndicateList />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
