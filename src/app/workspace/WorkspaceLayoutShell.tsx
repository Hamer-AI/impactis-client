'use client'

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useWorkspaceUI } from '@/stores/workspace-ui'
import { useWorkspaceTheme } from '@/app/workspace/WorkspaceThemeContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
    PanelLeftClose,
    PanelLeft,
    LayoutDashboard,
    UserRound,
    Building2,
    Settings2,
    LifeBuoy,
    LogOut,
    Menu,
    ArrowLeft,
    ShieldCheck,
    Bell,
    Palette,
    MessageCircle,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import SettingsSectionNavigator, { type SettingsSectionItem } from './settings/SettingsSectionNavigator'

function getAcronym(value: string): string {
    const parts = value.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'O'
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
    return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
}

function toTitleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

type WorkspaceNavItem = {
    href: string
    label: string
    icon: ComponentType<{ className?: string }>
}

type OrgType = 'startup' | 'investor' | 'advisor'

const SETTINGS_SECTIONS_STARTUP: Omit<SettingsSectionItem, 'href' | 'active'>[] = [
    { id: 'settings-identity', label: 'Organization Identity', icon: 'identity' },
    { id: 'settings-billing', label: 'Subscription & Billing', icon: 'billing' },
    { id: 'settings-startup-readiness', label: 'Startup Profile', icon: 'readiness' },
    { id: 'settings-discovery', label: 'Discovery Post', icon: 'discovery' },
    { id: 'settings-data-room', label: 'Investor Data Room', icon: 'dataroom' },
    { id: 'settings-invites', label: 'Team Invites', icon: 'invites' },
    { id: 'settings-permissions', label: 'Permission Rules', icon: 'permissions' },
    { id: 'settings-readiness-rules', label: 'Readiness Qualification Rules', icon: 'rules' },
]
const SETTINGS_SECTIONS_OTHER: Omit<SettingsSectionItem, 'href' | 'active'>[] = [
    { id: 'settings-identity', label: 'Organization Identity', icon: 'identity' },
    { id: 'settings-billing', label: 'Subscription & Billing', icon: 'billing' },
    { id: 'settings-invites', label: 'Team Invites', icon: 'invites' },
    { id: 'settings-permissions', label: 'Permission Rules', icon: 'permissions' },
    { id: 'settings-team-access', label: 'Team Access', icon: 'team' },
]

const PREFERENCES_SECTIONS = [
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
] as const

type SidebarNavLinkProps = {
    href: string
    label: string
    icon: ComponentType<{ className?: string }>
    active?: boolean
    collapsed?: boolean
    activeClassName: string
    idleClassName: string
}

function SidebarNavLink({
    href,
    label,
    icon: Icon,
    active,
    collapsed,
    activeClassName,
    idleClassName,
}: SidebarNavLinkProps) {
    const router = useRouter()

    function prefetchRoute() {
        router.prefetch(href)
    }

    return (
        <Button
            asChild
            variant="ghost"
            className={cn(
                'h-11 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300',
                'inline-flex items-center gap-3 px-3',
                active ? activeClassName : idleClassName,
                collapsed ? 'w-11 min-w-11 justify-center px-0' : 'w-full justify-start'
            )}
            title={collapsed ? label : undefined}
        >
            <Link href={href} prefetch onMouseEnter={prefetchRoute} onFocus={prefetchRoute} className="inline-flex h-full w-full items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <Icon className={cn('h-4 w-4', active ? 'text-emerald-500' : '')} />
                </span>
                <span
                    className={cn(
                        'truncate text-left transition-all duration-200',
                        collapsed ? 'w-0 overflow-hidden opacity-0' : 'min-w-0 flex-1'
                    )}
                    aria-hidden={collapsed}
                >
                    {label}
                </span>
            </Link>
        </Button>
    )
}

type WorkspaceLayoutShellProps = {
    children: ReactNode
    header: ReactNode
    initialIsLight: boolean
    membership: unknown
    profile: unknown
    organizationCoreTeam: unknown
    verificationMeta: unknown
    workspaceLabel: string
}

export default function WorkspaceLayoutShell({
    children,
    header,
    initialIsLight,
    membership,
    profile,
    organizationCoreTeam,
    verificationMeta,
    workspaceLabel,
}: WorkspaceLayoutShellProps) {
    const router = useRouter()
    const pathname = usePathname() ?? ''
    const searchParams = useSearchParams()
    const [mobileOpen, setMobileOpen] = useState(false)
    const { sidebarCollapsed: isCollapsed, setSidebarCollapsed } = useWorkspaceUI()
    const { isLight } = useWorkspaceTheme(initialIsLight)

    const pageShellClass = isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    const panelClass = isLight ? 'border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/40' : 'border-white/5 bg-slate-900/80'
    const textMainClass = isLight ? 'text-slate-900' : 'text-slate-100'
    const textMutedClass = isLight ? 'text-slate-500' : 'text-slate-400'
    const navActiveClass = isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-950/20'
    const navIdleClass = isLight ? 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900' : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'

    const orgType = (membership as { organization?: { type?: string } } | null)?.organization?.type as OrgType | undefined
    const isSettingsRoute = pathname.startsWith('/workspace/settings')
    const isPreferencesRoute = pathname.startsWith('/workspace/preferences')
    const isSubRoute = isSettingsRoute || isPreferencesRoute

    const navItems: WorkspaceNavItem[] = useMemo(
        () => [
            { href: '/workspace', label: 'Overview', icon: LayoutDashboard },
            { href: '/workspace/profile', label: 'Profile', icon: UserRound },
            { href: '/workspace/settings', label: 'Organization', icon: Building2 },
            { href: '/workspace/connections', label: 'Connections', icon: MessageCircle },
            { href: '/workspace/preferences', label: 'Settings', icon: Settings2 },
            { href: '/workspace/help', label: 'Help & Support', icon: LifeBuoy },
        ],
        []
    )

    const settingsSections: SettingsSectionItem[] = useMemo(() => {
        if (!isSettingsRoute || !orgType) return []
        const blueprint = orgType === 'startup' ? SETTINGS_SECTIONS_STARTUP : SETTINGS_SECTIONS_OTHER
        const sectionParam = searchParams.get('section')
        const allowedIds = new Set(blueprint.map((s) => s.id))
        const activeId = sectionParam && allowedIds.has(sectionParam) ? sectionParam : blueprint[0]?.id ?? 'settings-identity'
        return blueprint.map((s) => ({
            ...s,
            href: `/workspace/settings?section=${s.id}`,
            active: s.id === activeId,
        }))
    }, [isSettingsRoute, orgType, searchParams])

    const preferencesActiveId = isPreferencesRoute
        ? (searchParams.get('section') === 'notifications' ? 'notifications' : searchParams.get('section') === 'appearance' ? 'appearance' : 'security')
        : null

    useEffect(() => {
        const routes = ['/workspace', '/workspace/profile', '/workspace/settings', '/workspace/preferences', '/workspace/help']
        routes.forEach((r) => router.prefetch(r))
        router.prefetch('/workspace/settings?section=settings-identity')
        router.prefetch('/workspace/preferences?section=security')
    }, [router])

    return (
        <main data-workspace-root="true" className={`flex h-screen overflow-hidden ${pageShellClass}`}>
            {/* Ambient Background Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className={`absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full ${isLight ? 'bg-emerald-500/5' : 'bg-emerald-500/10'} blur-[120px] ws-float`} />
                <div className={`absolute right-[-10%] top-[40%] h-[340px] w-[340px] rounded-full ${isLight ? 'bg-blue-400/5' : 'bg-emerald-400/5'} blur-[100px] ws-float-delayed-1`} />
            </div>

            {/* Mobile navbar */}
            <div className="fixed inset-x-0 top-0 z-40 md:hidden">
                <div className={cn('flex h-16 items-center justify-between border-b px-4 backdrop-blur-xl', panelClass)}>
                    <div className="flex items-center gap-2">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="rounded-xl">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0">
                                <div className={cn('h-full p-5', isLight ? 'bg-white' : 'bg-slate-950')}>
                                    <SheetHeader className="mb-4">
                                        <SheetTitle className={cn(isLight ? 'text-slate-900' : 'text-slate-100')}>Impactis</SheetTitle>
                                    </SheetHeader>
                                    <div className="space-y-2">
                                        {navItems.map((item) => (
                                            <Button
                                                key={item.href}
                                                asChild
                                                variant="ghost"
                                                className={cn('w-full justify-start gap-3 rounded-xl', navIdleClass)}
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                <Link href={item.href}>
                                                    <item.icon className="h-4 w-4" />
                                                    {item.label}
                                                </Link>
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="mt-6 space-y-4">
                                        <Separator className={cn(isLight ? 'bg-slate-200/70' : 'bg-slate-800/60')} />
                                        <form action="/auth/signout" method="post">
                                            <Button type="submit" variant="ghost" className="w-full justify-start gap-3 rounded-xl text-rose-600 hover:bg-rose-500/10">
                                                <LogOut className="h-4 w-4" />
                                                Sign out
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <span className="text-sm font-black tracking-tight text-emerald-500">Impactis</span>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar: one sidebar; on Organization/Settings route it shows section list instead of main nav. Collapse applies to both. */}
            <aside className={cn('hidden md:flex relative flex-col border-r backdrop-blur-3xl ws-fade-in shrink-0 h-full transition-[width] duration-300', panelClass, isCollapsed ? 'w-20' : 'w-[280px]')}>
                <div className={cn('flex flex-col h-full min-h-0 overflow-hidden', isLight ? 'bg-slate-100/20' : 'bg-slate-950/20')}>
                    {/* Header: fixed, not scrollable */}
                    <div className={cn('shrink-0 p-6', isCollapsed ? 'px-3' : '')}>
                        {isSubRoute ? (
                            <div className={cn('flex flex-col gap-4', isCollapsed ? 'items-center' : '')}>
                                <Link
                                    href="/workspace"
                                    className={cn('inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors', isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200', isCollapsed && 'justify-center p-2')}
                                    title="Back to Workspace"
                                >
                                    <ArrowLeft className="h-3 w-3 shrink-0" />
                                    <span className={cn('truncate transition-all duration-200', isCollapsed ? 'w-0 overflow-hidden opacity-0' : '')} aria-hidden={isCollapsed}>Workspace</span>
                                </Link>
                                <div className="flex items-center justify-between gap-3">
                                    <p className={cn('text-lg font-black tracking-tight truncate transition-all duration-200', textMainClass, isCollapsed ? 'w-0 opacity-0 overflow-hidden' : '')} aria-hidden={isCollapsed}>
                                        {isSettingsRoute ? 'Organization' : 'Settings'}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSidebarCollapsed((prev: boolean) => !prev)}
                                        className={cn('rounded-xl hover:bg-emerald-500/10 active:scale-95 shrink-0', navIdleClass)}
                                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                    >
                                        <span className="relative inline-flex h-4 w-4 items-center justify-center">
                                            <PanelLeft className={cn('absolute h-4 w-4 transition-all duration-300', isCollapsed ? 'scale-100 opacity-100' : 'scale-75 opacity-0')} />
                                            <PanelLeftClose className={cn('absolute h-4 w-4 transition-all duration-300', isCollapsed ? 'scale-75 opacity-0' : 'scale-100 opacity-100')} />
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-3">
                                <p
                                    className={cn(
                                        'truncate text-xl font-black tracking-[-0.02em] text-emerald-500 transition-all duration-200',
                                        isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                                    )}
                                    aria-hidden={isCollapsed}
                                >
                                    Impactis
                                </p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSidebarCollapsed((prev: boolean) => !prev)}
                                    className={cn('rounded-xl hover:bg-emerald-500/10 active:scale-95', navIdleClass)}
                                >
                                    <span className="relative inline-flex h-4 w-4 items-center justify-center">
                                        <PanelLeft className={cn('absolute h-4 w-4 transition-all duration-300', isCollapsed ? 'scale-100 opacity-100' : 'scale-75 opacity-0')} />
                                        <PanelLeftClose className={cn('absolute h-4 w-4 transition-all duration-300', isCollapsed ? 'scale-75 opacity-0' : 'scale-100 opacity-100')} />
                                    </span>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Nav list: scrollable only this part */}
                    <div className={cn('flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-4', isCollapsed ? 'flex flex-col items-center px-2' : 'px-4')}>
                        {isSettingsRoute && settingsSections.length > 0 ? (
                            <div className={cn('space-y-4', isCollapsed ? 'flex flex-col items-center w-full' : '')}>
                                {/* Organization profile / identity block - hidden when collapsed */}
                                {!isCollapsed && (() => {
                                    const m = membership as { organization?: { name?: string; logo_url?: string | null }; member_role?: string } | null
                                    const org = m?.organization
                                    if (!org) return null
                                    return (
                                        <div className={cn('rounded-2xl border p-4', isLight ? 'border-slate-200/80 bg-white/80' : 'border-white/[0.06] bg-slate-900/40')}>
                                            <div className="flex items-center gap-3">
                                                <Avatar className={cn('h-11 w-11 ring-2 shrink-0', isLight ? 'ring-slate-200' : 'ring-slate-800')}>
                                                    <AvatarImage src={org.logo_url ?? undefined} alt="Organization" />
                                                    <AvatarFallback className={cn('text-xs font-black', isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400')}>
                                                        {getAcronym(org.name ?? 'O')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className={cn('truncate text-sm font-black tracking-tight', textMainClass)}>
                                                        {org.name ?? 'Organization'}
                                                    </p>
                                                    {m?.member_role && (
                                                        <Badge variant="secondary" className="mt-1 rounded-md px-1.5 py-0 text-[9px] font-black uppercase tracking-wider">
                                                            {toTitleCase(m.member_role)}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}
                                {!isCollapsed && (
                                    <p className={cn('px-3 text-[9px] font-black uppercase tracking-[0.25em]', textMutedClass, 'opacity-60')}>
                                        Organization Settings
                                    </p>
                                )}
                                <div className={cn('space-y-1.5', isCollapsed ? 'flex flex-col items-center w-full' : '')}>
                                    <SettingsSectionNavigator sections={settingsSections} isLight={isLight} collapsed={isCollapsed} />
                                </div>
                            </div>
                        ) : isPreferencesRoute ? (
                            <div className={cn('space-y-1.5', isCollapsed ? 'flex flex-col items-center w-full' : '')}>
                                {!isCollapsed && (
                                    <p className={cn('mb-4 px-3 text-[9px] font-black uppercase tracking-[0.25em]', textMutedClass, 'opacity-60')}>
                                        Preferences
                                    </p>
                                )}
                                {PREFERENCES_SECTIONS.map((section) => {
                                    const active = section.id === preferencesActiveId
                                    const Icon = section.icon
                                    return (
                                        <Button
                                            key={section.id}
                                            asChild
                                            variant="ghost"
                                            className={cn(
                                                'rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300',
                                                'inline-flex items-center gap-3 px-3',
                                                active ? navActiveClass : navIdleClass,
                                                isCollapsed ? 'h-11 w-11 min-w-11 justify-center px-0' : 'w-full justify-start px-4 py-3'
                                            )}
                                            title={isCollapsed ? section.label : undefined}
                                        >
                                            <Link href={`/workspace/preferences?section=${section.id}`} className="inline-flex h-full w-full items-center gap-3">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                                                    <Icon className={cn('h-4 w-4', active ? 'text-emerald-500' : '')} />
                                                </span>
                                                <span className={cn('truncate text-left transition-all duration-200', isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'min-w-0 flex-1')} aria-hidden={isCollapsed}>
                                                    {section.label}
                                                </span>
                                            </Link>
                                        </Button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className={cn('flex flex-col gap-1', isCollapsed ? 'items-center w-full' : '')}>
                                {navItems.map((item) => (
                                    <SidebarNavLink
                                        key={item.href}
                                        href={item.href}
                                        label={item.label}
                                        icon={item.icon}
                                        active={item.href === '/workspace' ? (pathname === '/workspace' || pathname === '/workspace/') : pathname.startsWith(item.href)}
                                        collapsed={isCollapsed}
                                        activeClassName={navActiveClass}
                                        idleClassName={navIdleClass}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer: fixed, sign out only (no theme toggle) */}
                    <div className={cn('shrink-0 p-6', isCollapsed ? 'px-3' : '')}>
                        <Separator className={cn('mb-4', isLight ? 'bg-slate-200/70' : 'bg-slate-800/60')} />
                        <form action="/auth/signout" method="post">
                            <Button
                                type="submit"
                                variant="ghost"
                                className={cn(
                                    'w-full items-center gap-3 rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-500/10',
                                    isCollapsed ? 'justify-center px-0 w-12 h-12 mx-auto' : 'justify-start'
                                )}
                                title={isCollapsed ? 'Sign out' : undefined}
                            >
                                <LogOut className="h-4 w-4 shrink-0" />
                                <span className={cn('truncate transition-all duration-200', isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100')} aria-hidden={isCollapsed && !isSubRoute}>
                                    Sign out
                                </span>
                            </Button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Dashboard Workspace */}
            <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden pt-16 md:pt-0">
                {header}
                {children}
            </div>
        </main>
    )
}
