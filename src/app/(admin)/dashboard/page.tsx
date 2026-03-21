'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BarChart3, Building2, FileText, Inbox, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminStats } from '@/modules/admin/admin.repository'
import { cn } from '@/lib/utils'

function safeText(value: unknown): string {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    return ''
}

export default function AdminOverviewClient() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any | null>(null)

    const textMain = 'text-slate-900 dark:text-slate-100'
    const textMuted = 'text-slate-500 dark:text-slate-400'
    const panel = 'border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/60'

    function refreshAll() {
        setLoading(true)
        adminStats()
            .then(s => setStats(s))
            .catch(() => toast.error('Failed to load stats'))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        refreshAll()
    }, [])

    return (
        <section className="flex flex-1 flex-col min-w-0 overflow-y-auto p-4 md:p-8 space-y-6">
            <div className="mx-auto max-w-6xl w-full space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className={cn('text-2xl font-black tracking-tight', textMain)}>Dashboard Overview</h1>
                        <p className={cn('mt-1 text-sm', textMuted)}>At-a-glance platform metrics</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card className={panel}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className={cn('text-sm font-black uppercase tracking-widest', textMain)}>Organizations</CardTitle>
                            <Building2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent className={cn('text-sm', textMuted)}>
                            {loading ? 'Loading…' : (Array.isArray(stats?.org_counts) ? stats.org_counts.reduce((acc: number, r: any) => acc + (typeof r.count === 'number' ? r.count : 0), 0) : 0)}
                        </CardContent>
                    </Card>
                    <Card className={panel}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className={cn('text-sm font-black uppercase tracking-widest', textMain)}>Deal rooms</CardTitle>
                            <BarChart3 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent className={cn('text-sm', textMuted)}>
                            {loading ? 'Loading…' : safeText(stats?.active_deal_rooms ?? 0)}
                        </CardContent>
                    </Card>
                    <Card className={panel}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className={cn('text-sm font-black uppercase tracking-widest', textMain)}>Agreements (30d)</CardTitle>
                            <FileText className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent className={cn('text-sm', textMuted)}>
                            {loading ? 'Loading…' : safeText(stats?.agreements_signed_30d ?? 0)}
                        </CardContent>
                    </Card>
                    <Card className={panel}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className={cn('text-sm font-black uppercase tracking-widest', textMain)}>Users</CardTitle>
                            <Users className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent className={cn('text-sm', textMuted)}>
                            {loading ? 'Loading…' : safeText(stats?.user_count ?? 0)}
                        </CardContent>
                    </Card>
                    <Card className={panel}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className={cn('text-sm font-black uppercase tracking-widest', textMain)}>Open tickets</CardTitle>
                            <Inbox className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent className={cn('text-sm', textMuted)}>
                            {loading ? 'Loading…' : safeText(stats?.open_tickets ?? 0)}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
