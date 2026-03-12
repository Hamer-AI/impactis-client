'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPendingConnectionCount } from '@/modules/connections/connections.repository'
import { cn } from '@/lib/utils'

type Props = {
    isLight: boolean
    className?: string
}

export default function ConnectionRequestsWidget({ isLight, className }: Props) {
    const [count, setCount] = useState<number | null>(null)

    useEffect(() => {
        getPendingConnectionCount().then(setCount)
    }, [])

    if (count === null || count === 0) return null

    return (
        <div
            className={cn(
                'rounded-2xl border p-4',
                isLight ? 'border-emerald-200 bg-emerald-50/70' : 'border-emerald-500/30 bg-emerald-500/10',
                className
            )}
        >
            <p className={cn('text-sm font-bold', isLight ? 'text-emerald-800' : 'text-emerald-300')}>
                You have {count} connection request{count !== 1 ? 's' : ''}
            </p>
            <p className={cn('text-xs mt-0.5', isLight ? 'text-emerald-700/80' : 'text-emerald-400/80')}>
                Investors or advisors want to connect. Accept or decline in Connections.
            </p>
            <Button asChild size="sm" className="mt-3 gap-1.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                <Link href="/workspace/connections">
                    <MessageCircle className="h-3.5 w-3.5" />
                    View requests
                </Link>
            </Button>
        </div>
    )
}
