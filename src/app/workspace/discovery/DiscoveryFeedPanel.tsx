'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Compass, MapPin, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { UnifiedDiscoveryCard } from '@/modules/workspace/types'

type ViewerOrgType = 'startup' | 'investor' | 'advisor'

type DiscoveryFeedPanelProps = {
    feed: UnifiedDiscoveryCard[]
    viewerOrgId: string
    viewerOrgType: ViewerOrgType
}

const ROLE_FILTER_OPTIONS: { value: 'all' | ViewerOrgType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'startup', label: 'Startup' },
    { value: 'investor', label: 'Investor' },
    { value: 'advisor', label: 'Advisor' },
]

function roleLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}

export default function DiscoveryFeedPanel({ feed, viewerOrgId, viewerOrgType }: DiscoveryFeedPanelProps) {
    const [query, setQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<'all' | ViewerOrgType>('all')

    const filteredFeed = useMemo(() => {
        let list = feed.filter((item) => item.org_id !== viewerOrgId)
        if (roleFilter !== 'all') {
            list = list.filter((item) => item.org_type === roleFilter)
        }
        if (query.trim()) {
            const q = query.trim().toLowerCase()
            list = list.filter((item) => {
                const searchable = [
                    item.name,
                    item.description,
                    item.location ?? '',
                    item.stage ?? '',
                    ...item.industry_or_expertise,
                ].join(' ').toLowerCase()
                return searchable.includes(q)
            })
        }
        return list
    }, [feed, viewerOrgId, roleFilter, query])

    const imageUrl = (card: UnifiedDiscoveryCard) =>
        card.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(card.name)}&size=400&background=0D9488&color=fff&bold=true`

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Compass className="h-7 w-7 text-emerald-500" />
                        Discovery
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Find startups, investors, and advisors to connect with.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex flex-1 items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-3 py-2 shadow-sm focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900/80 dark:focus-within:border-emerald-500/50">
                    <Search className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name, industry, expertise..."
                        className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                        aria-label="Search discovery"
                    />
                    {query ? (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                    {ROLE_FILTER_OPTIONS.map((opt) => (
                        <Button
                            key={opt.value}
                            variant={roleFilter === opt.value ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-xl font-semibold"
                            onClick={() => setRoleFilter(opt.value)}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
            </div>

            {filteredFeed.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-12 text-center">
                    <Compass className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <p className="mt-4 font-semibold text-slate-600 dark:text-slate-400">No results</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                        Try changing the filter or search, or check back later for new profiles.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredFeed.map((card) => (
                        <div
                            key={card.org_id}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/60 dark:hover:border-emerald-500/30"
                        >
                            <div className="relative h-44 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-950">
                                <img
                                    src={imageUrl(card)}
                                    alt=""
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                                    <Badge className="border-0 bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
                                        {roleLabel(card.org_type)}
                                    </Badge>
                                    {card.stage ? (
                                        <Badge variant="secondary" className="text-[10px] font-semibold">
                                            {card.stage}
                                        </Badge>
                                    ) : null}
                                </div>
                                {card.location ? (
                                    <div className="absolute inset-x-0 bottom-0 p-3">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-900/90 dark:text-slate-300">
                                            <MapPin className="h-3 w-3 text-emerald-500" />
                                            {card.location}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                            <div className="flex flex-1 flex-col p-4">
                                <h3 className="font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                    {card.name}
                                </h3>
                                {card.description ? (
                                    <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                        {card.description}
                                    </p>
                                ) : null}
                                {card.industry_or_expertise.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {card.industry_or_expertise.slice(0, 4).map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                                <div className="mt-4 flex-1" />
                                <Button asChild className="mt-3 w-full rounded-xl font-semibold" size="sm">
                                    <Link href={`/workspace/discovery/${card.org_id}?type=${card.org_type}&viewerType=${viewerOrgType}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
