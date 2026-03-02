import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
    Building2,
    LayoutDashboard,
    MapPin,
    Settings2,
    UserRound,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getOnboardingPath } from '@/modules/onboarding'
import { getWorkspaceIdentityForUser } from '@/modules/workspace'
import WorkspaceThemeToggle from '../WorkspaceThemeToggle'
import WorkspaceUserMenu from '../WorkspaceUserMenu'
import ProfileForm from './ProfileForm'

function getValue(value: string | null): string {
    return value && value.trim().length > 0 ? value : 'Not set yet'
}

function getInitials(name: string | null): string {
    if (!name) {
        return 'U'
    }

    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) {
        return 'U'
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 1).toUpperCase()
    }

    return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
}

function getProfileCompleteness(input: {
    fullName: string | null
    location: string | null
    bio: string | null
    headline: string | null
    phone: string | null
    timezoneName: string | null
    websiteUrl: string | null
}): {
    completed: number
    total: number
    percent: number
    label: string
    variant: 'success' | 'warning' | 'secondary'
} {
    const total = 7
    let completed = 0

    if (input.fullName && input.fullName.trim().length > 1) {
        completed += 1
    }

    if (input.location && input.location.trim().length > 1) {
        completed += 1
    }

    if (input.bio && input.bio.trim().length >= 20) {
        completed += 1
    }

    if (input.headline && input.headline.trim().length > 1) {
        completed += 1
    }

    if (input.phone && input.phone.trim().length > 7) {
        completed += 1
    }

    if (input.timezoneName && input.timezoneName.trim().length > 2) {
        completed += 1
    }

    if (input.websiteUrl && input.websiteUrl.trim().length > 8) {
        completed += 1
    }

    const percent = Math.round((completed / total) * 100)

    if (percent === 100) {
        return { completed, total, percent, label: 'Excellent', variant: 'success' }
    }

    if (percent >= 67) {
        return { completed, total, percent, label: 'Good', variant: 'warning' }
    }

    return { completed, total, percent, label: 'Getting Started', variant: 'secondary' }
}

function SidebarNavLink(input: {
    href: string
    label: string
    icon: ComponentType<{ className?: string }>
    active?: boolean
    activeClassName: string
    idleClassName: string
}) {
    const Icon = input.icon

    return (
        <Button
            asChild
            variant="ghost"
            className={`w-full justify-start gap-2.5 border ${input.active ? input.activeClassName : input.idleClassName}`}
        >
            <Link href={input.href}>
                <Icon className="h-4 w-4" />
                {input.label}
            </Link>
        </Button>
    )
}

export default async function WorkspaceProfilePage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { profile, membership } = await getWorkspaceIdentityForUser(supabase, user)

    if (!membership) {
        redirect(getOnboardingPath())
    }

    const cookieStore = await cookies()
    const themeCookie = cookieStore.get('workspace_theme')?.value
    const isLight = themeCookie === 'light'

    const firstName = profile.full_name?.trim().split(/\s+/)[0] ?? 'there'
    const completeness = getProfileCompleteness({
        fullName: profile.full_name,
        location: profile.location,
        bio: profile.bio,
        headline: profile.headline,
        phone: profile.phone,
        timezoneName: profile.timezone_name,
        websiteUrl: profile.website_url,
    })

    const setupAccountDone = !!membership
    const uploadPhotoDone = !!(profile.avatar_url && profile.avatar_url.trim().length > 0)
    const personalInfoDone = !!(profile.full_name?.trim().length && profile.phone?.trim().length)
    const locationDone = !!(profile.location && profile.location.trim().length > 1)
    const websiteDone = !!(profile.website_url && profile.website_url.trim().length > 8)
    const linkedinDone = !!(profile.linkedin_url && profile.linkedin_url.trim().length > 8)
    const timezoneDone = !!(profile.timezone_name && profile.timezone_name.trim().length > 0)
    const preferredContactDone = !!profile.preferred_contact_method
    const biographyDone = !!(profile.bio && profile.bio.trim().length >= 20)

    const completionSteps = [
        setupAccountDone,
        uploadPhotoDone,
        personalInfoDone,
        locationDone,
        websiteDone,
        linkedinDone,
        timezoneDone,
        preferredContactDone,
        biographyDone,
    ]
    const completedSteps = completionSteps.filter(Boolean).length
    const profileCompletePercent = Math.round((completedSteps / completionSteps.length) * 100)

    const pageShellClass = isLight
        ? 'bg-slate-50 text-slate-900'
        : 'bg-[#070b14] text-slate-100'
    const heroGradientClass = isLight
        ? 'bg-[radial-gradient(circle_at_10%_8%,rgba(16,185,129,0.08),transparent_36%),radial-gradient(circle_at_86%_0%,rgba(37,99,235,0.08),transparent_36%)]'
        : 'bg-[radial-gradient(circle_at_10%_8%,rgba(16,185,129,0.24),transparent_36%),radial-gradient(circle_at_86%_0%,rgba(59,130,246,0.24),transparent_36%)]'
    const panelClass = isLight
        ? 'border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/40'
        : 'border-slate-800 bg-slate-900/70'
    const mutedPanelClass = isLight
        ? 'border-slate-200 bg-slate-50/90'
        : 'border-slate-800 bg-slate-950/70'
    const textMainClass = isLight ? 'text-slate-900' : 'text-slate-100'
    const textMutedClass = isLight ? 'text-slate-500' : 'text-slate-400'
    const titleMutedClass = isLight ? 'text-slate-500' : 'text-slate-400'
    const navActiveClass = isLight
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
        : 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
    const navIdleClass = isLight
        ? 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border-transparent'
        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100 border-transparent'

    return (
        <main data-workspace-root="true" className={`relative min-h-screen overflow-hidden ${pageShellClass}`}>
            {/* Ambient Background Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className={`absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full ${isLight ? 'bg-emerald-500/5' : 'bg-emerald-500/10'} blur-[120px] ws-float`} />
                <div className={`absolute right-[-10%] top-[40%] h-[340px] w-[340px] rounded-full ${isLight ? 'bg-blue-400/5' : 'bg-emerald-400/5'} blur-[100px] ws-float-delayed-1`} />
            </div>

            <div className="relative mx-auto max-w-[1400px] px-6 py-8 md:py-12">
                <div className="flex flex-col gap-10">
                    {/* Immersive Profile Hero */}
                    <header className={`relative overflow-hidden rounded-[2.5rem] border p-8 md:p-12 shadow-2xl transition-all duration-500 ${panelClass} backdrop-blur-3xl`}>
                        <div className="relative z-10 flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
                                {/* Large Avatar Workspace */}
                                <div className="relative group">
                                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 opacity-20 blur-sm transition-all group-hover:opacity-40" />
                                    <Avatar className={`relative h-32 w-32 border-4 ${isLight ? 'border-white shadow-xl' : 'border-slate-900 shadow-2xl'}`}>
                                        <AvatarImage src={profile.avatar_url ?? undefined} alt="Profile avatar" />
                                        <AvatarFallback className={`text-3xl font-black ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-slate-500'}`}>
                                            {getInitials(profile.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="text-center lg:text-left">
                                    <div className="flex items-center justify-center gap-3 lg:justify-start">
                                        <Badge variant="outline" className={`border-emerald-500/30 bg-emerald-500/5 text-[10px] font-black uppercase tracking-widest text-emerald-500`}>
                                            {membership.member_role}
                                        </Badge>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${textMutedClass}`}>
                                            Identity Active
                                        </span>
                                    </div>
                                    <h1 className={`mt-4 text-4xl font-black tracking-tight md:text-5xl ${textMainClass}`}>
                                        {profile.full_name?.trim() || 'No Name Set'}
                                    </h1>
                                    {profile.headline ? (
                                        <p className={`mt-2 text-sm font-semibold ${textMutedClass}`}>
                                            {profile.headline}
                                        </p>
                                    ) : null}
                                    <div className={`mt-3 flex items-center justify-center gap-4 text-sm font-medium lg:justify-start ${textMutedClass}`}>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4 text-emerald-500" />
                                            {getValue(profile.location)}
                                        </div>
                                        <span className="opacity-20">|</span>
                                        <div className="flex items-center gap-1.5">
                                            <LayoutDashboard className="h-4 w-4 text-blue-500" />
                                            {membership.organization.name}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Theme & Meta Controls */}
                        <div className="absolute top-6 right-6 flex items-center gap-3">
                            <WorkspaceThemeToggle />
                            <Link href="/workspace">
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors">
                                    <Settings2 className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </header>

                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                        {/* Main Interaction Area */}
                        <div className="space-y-8">
                            <ProfileForm
                                defaultEmail={user?.email ?? ''}
                                defaultFullName={profile.full_name ?? ''}
                                defaultAvatarUrl={profile.avatar_url ?? ''}
                                defaultLocation={profile.location ?? ''}
                                defaultBio={profile.bio ?? ''}
                                defaultPhone={profile.phone ?? ''}
                                defaultHeadline={profile.headline ?? ''}
                                defaultWebsiteUrl={profile.website_url ?? ''}
                                defaultLinkedinUrl={profile.linkedin_url ?? ''}
                                defaultTimezoneName={profile.timezone_name ?? ''}
                                defaultPreferredContactMethod={profile.preferred_contact_method ?? ''}
                                isLight={isLight}
                            />
                        </div>

                        {/* Complete your profile - right column */}
                        <aside className="space-y-6">
                            <div className={`flex flex-col gap-6 rounded-[2rem] border p-6 ${panelClass} backdrop-blur-xl sticky top-8`}>
                                <h3 className={`text-sm font-bold ${textMainClass}`}>Complete your profile</h3>
                                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center mx-auto">
                                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className={isLight ? 'text-slate-200' : 'text-slate-700'} />
                                        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 - (profileCompletePercent / 100) * (2 * Math.PI * 42)} strokeLinecap="round" className="text-emerald-500 transition-all duration-500 ease-out" />
                                    </svg>
                                    <span className={`absolute text-lg font-bold ${textMainClass}`}>{profileCompletePercent}%</span>
                                </div>
                                <ul className="space-y-3 text-sm">
                                    <li className={`flex items-center gap-2 ${setupAccountDone ? 'text-emerald-600' : textMutedClass}`}>
                                        <span>{setupAccountDone ? '✓' : '✗'}</span>
                                        <span>Setup account</span>
                                    </li>
                                    <li className={`flex items-center gap-2 ${uploadPhotoDone ? 'text-emerald-600' : textMutedClass}`}>
                                        <span>{uploadPhotoDone ? '✓' : '✗'}</span>
                                        <span>Upload your photo</span>
                                    </li>
                                    <li className={`flex items-center gap-2 ${personalInfoDone ? 'text-emerald-600' : textMutedClass}`}>
                                        <span>{personalInfoDone ? '✓' : '✗'}</span>
                                        <span>Personal info (name & phone)</span>
                                    </li>
                                    <li className={`flex items-center gap-2 ${locationDone ? 'text-emerald-600' : textMutedClass}`}>
                                        <span>{locationDone ? '✓' : '✗'}</span>
                                        <span>Location</span>
                                    </li>
                                    <li className={`flex items-center gap-2 ${websiteDone ? 'text-emerald-600' : textMutedClass}`}>
                                        <span>{websiteDone ? '✓' : '✗'}</span>
                                        <span>Website URL</span>
                                    </li>
                                    <li className={`flex items-center gap-2 ${linkedinDone ? 'text-emerald-600' : textMutedClass}`}>
                                        <span>{linkedinDone ? '✓' : '✗'}</span>
                                        <span>LinkedIn URL</span>
                                    </li>
                                    <li className={`flex items-center gap-2 ${timezoneDone ? 'text-emerald-600' : textMutedClass}`}>
                                        <span>{timezoneDone ? '✓' : '✗'}</span>
                                        <span>Timezone</span>
                                    </li>
                                    <li className={`flex items-center gap-2 ${preferredContactDone ? 'text-emerald-600' : textMutedClass}`}>
                                        <span>{preferredContactDone ? '✓' : '✗'}</span>
                                        <span>Preferred contact</span>
                                    </li>
                                    <li className={`flex items-center gap-2 ${biographyDone ? 'text-emerald-600' : textMutedClass}`}>
                                        <span>{biographyDone ? '✓' : '✗'}</span>
                                        <span>Bio</span>
                                    </li>
                                </ul>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </main>
    )
}
