'use client'

import Link from 'next/link'
import { LayoutDashboard, LogOut, Settings, UserRound } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type LandingUserMenuProps = {
    displayName: string
    email: string | null
    imageUrl?: string | null
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'U'
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
    return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
}

export default function LandingUserMenu({ displayName, email, imageUrl }: LandingUserMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Open account menu"
                className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-0 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md hover:ring-2 hover:ring-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
                <Avatar className="h-full w-full">
                    <AvatarImage className="h-full w-full object-cover object-center" src={imageUrl ?? undefined} alt={`${displayName} avatar`} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-emerald-500 text-xs font-semibold text-white">
                        {getInitials(displayName)}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <p className="truncate text-sm font-semibold normal-case tracking-normal text-slate-900">{displayName}</p>
                    {email ? <p className="truncate text-xs font-medium normal-case tracking-normal text-slate-500">{email}</p> : null}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/workspace" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/workspace/profile" className="flex items-center gap-2">
                        <UserRound className="h-4 w-4" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/workspace/preferences" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action="/auth/signout" method="post" className="p-1">
                    <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </Button>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
