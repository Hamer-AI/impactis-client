'use client'

import { useWorkspaceTheme } from '@/app/workspace/WorkspaceThemeContext'
import { Plus } from 'lucide-react'

export default function SyndicateList() {
    const { isLight } = useWorkspaceTheme()
    
    const panel = isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-900/60'
    const textMuted = isLight ? 'text-slate-500' : 'text-slate-400'

    return (
        <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed ${panel}`}>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <Plus className={`h-6 w-6 ${textMuted}`} />
            </div>
            <h3 className="font-semibold mb-1">No syndicates yet</h3>
            <p className={`text-sm ${textMuted} max-w-sm`}>
                You haven't formed or joined any syndicates yet. Get started by clicking "Form Syndicate" above.
            </p>
        </div>
    )
}
