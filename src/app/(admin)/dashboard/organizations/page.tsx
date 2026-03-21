'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminOrganizations, adminForceTier, adminUpdateOrgStatus } from '@/modules/admin/admin.repository'
import { cn } from '@/lib/utils'

function safeText(value: unknown): string {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    return ''
}

export default function AdminOrganizationsPage() {
    const [loading, setLoading] = useState(true)
    const [orgs, setOrgs] = useState<any[]>([])
    const [orgFilter, setOrgFilter] = useState('')

    const textMain = 'text-slate-900 dark:text-slate-100'
    const textMuted = 'text-slate-500 dark:text-slate-400'
    const panel = 'border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/60'

    const filteredOrgs = useMemo(() => {
        const q = orgFilter.trim().toLowerCase()
        if (!q) return orgs
        return orgs.filter((o) => safeText(o.name).toLowerCase().includes(q) || safeText(o.org_id).toLowerCase().includes(q))
    }, [orgs, orgFilter])

    function refreshAll() {
        setLoading(true)
        adminOrganizations({ limit: 200 })
            .then(o => setOrgs(o))
            .catch(() => toast.error('Failed to load organizations'))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        refreshAll()
    }, [])

    async function forceTier(orgId: string, planCode: 'free' | 'pro' | 'elite') {
        const ok = await adminForceTier(orgId, planCode)
        if (!ok) toast.error('Failed to change tier')
        else {
            toast.success('Tier updated')
            refreshAll()
        }
    }

    async function setOrgStatus(orgId: string, status: 'active' | 'suspended' | 'deleted') {
        const ok = await adminUpdateOrgStatus(orgId, status, 'Manual update from admin UI')
        if (!ok) toast.error('Failed to update status')
        else {
            toast.success('Status updated')
            refreshAll()
        }
    }

    return (
        <section className="flex flex-1 flex-col min-w-0 overflow-y-auto p-4 md:p-8 space-y-6">
            <div className="mx-auto max-w-6xl w-full space-y-6">
                <div>
                    <h1 className={cn('text-2xl font-black tracking-tight', textMain)}>Organizations</h1>
                    <p className={cn('mt-1 text-sm', textMuted)}>Manage all platform organizations, subscription tiers, and access statuses.</p>
                </div>

                <Card className={panel}>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <CardTitle className={cn('text-sm font-black uppercase tracking-widest', textMain)}>Organizations Directory</CardTitle>
                        <div className="flex items-center gap-2">
                            <Input
                                value={orgFilter}
                                onChange={(e) => setOrgFilter(e.target.value)}
                                placeholder="Search org name or id…"
                                className="max-w-xs rounded-xl"
                            />
                            <Button variant="outline" size="icon" onClick={refreshAll} disabled={loading}>
                                <Building2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrgs.map((o) => (
                                    <TableRow key={safeText(o.org_id)}>
                                        <TableCell className={cn('font-semibold', textMain)}>{safeText(o.name)}</TableCell>
                                        <TableCell className={textMuted}>{safeText(o.org_type)}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{safeText(o.status ?? 'active')}</Badge>
                                        </TableCell>
                                        <TableCell className={textMuted}>{safeText(o.plan_code ?? 'free')}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex gap-2">
                                                <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={() => forceTier(safeText(o.org_id), 'pro')}>Set Pro</Button>
                                                <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={() => forceTier(safeText(o.org_id), 'elite')}>Set Elite</Button>
                                                <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={() => setOrgStatus(safeText(o.org_id), 'suspended')}>Suspend</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredOrgs.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                                            No organizations found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
