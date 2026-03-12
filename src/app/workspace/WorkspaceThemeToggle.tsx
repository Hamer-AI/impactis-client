'use client'

import { Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useWorkspaceTheme } from '@/app/workspace/WorkspaceThemeContext'
import { cn } from '@/lib/utils'

export default function WorkspaceThemeToggle({ className }: { className?: string }) {
    const { isLight, setTheme } = useWorkspaceTheme()

    return (
        <div
            className={cn(
                'flex items-center gap-2 rounded-full border p-1',
                isLight ? 'border-slate-200 bg-slate-100/50' : 'border-white/5 bg-slate-950/40',
                className
            )}
            role="group"
            aria-label="Theme"
        >
            <span
                className={cn(
                    'flex h-7 items-center gap-1.5 rounded-full px-2 text-[10px] font-bold uppercase tracking-wider transition-colors',
                    !isLight ? 'text-emerald-400' : 'text-slate-400'
                )}
            >
                <Moon className="h-3.5 w-3.5" aria-hidden />
                Night
            </span>
            <Switch
                checked={isLight}
                onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')}
                aria-label="Toggle bright mode"
                className={cn(
                    'data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700',
                    'focus-visible:ring-emerald-500/50'
                )}
            />
            <span
                className={cn(
                    'flex h-7 items-center gap-1.5 rounded-full px-2 text-[10px] font-bold uppercase tracking-wider transition-colors',
                    isLight ? 'text-emerald-600' : 'text-slate-400'
                )}
            >
                <Sun className="h-3.5 w-3.5" aria-hidden />
                Bright
            </span>
        </div>
    )
}
