'use client'

import { useActionState, useState, ChangeEvent, useEffect, MouseEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ActionFeedback } from '@/components/ui/action-feedback'
import { Pencil, MapPin, Trash2 } from 'lucide-react'
import { useTransientActionNotice } from '@/lib/use-transient-action-notice'
import { updateProfileAction, type UpdateProfileActionState } from './actions'

type ProfileFormProps = {
    defaultEmail: string
    defaultFullName: string
    defaultAvatarUrl: string
    defaultLocation: string
    defaultBio: string
    defaultPhone: string
    defaultHeadline: string
    defaultWebsiteUrl: string
    defaultLinkedinUrl: string
    defaultTimezoneName: string
    defaultPreferredContactMethod: string
    isLight?: boolean
}

const initialState: UpdateProfileActionState = {
    error: null,
    success: null,
}

function toTitleCase(value: string): string {
    if (!value) return ''
    return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function ProfileForm({
    defaultEmail,
    defaultFullName,
    defaultAvatarUrl,
    defaultLocation,
    defaultBio,
    defaultPhone,
    defaultHeadline,
    defaultWebsiteUrl,
    defaultLinkedinUrl,
    defaultTimezoneName,
    defaultPreferredContactMethod,
    isLight = true,
}: ProfileFormProps) {
    const [state, formAction, isPending] = useActionState(updateProfileAction, initialState)
    const notice = useTransientActionNotice(state)
    const [editingPersonalInfo, setEditingPersonalInfo] = useState(false)
    const [editingLocation, setEditingLocation] = useState(false)
    const [editingContacts, setEditingContacts] = useState(false)
    const [editingBio, setEditingBio] = useState(false)
    const [fullName, setFullName] = useState(defaultFullName)
    const [phone, setPhone] = useState(defaultPhone)
    const [location, setLocation] = useState(defaultLocation)
    const [websiteUrl, setWebsiteUrl] = useState(defaultWebsiteUrl)
    const [linkedinUrl, setLinkedinUrl] = useState(defaultLinkedinUrl)
    const [timezoneName, setTimezoneName] = useState(defaultTimezoneName || 'UTC')
    const [preferredContactMethod, setPreferredContactMethod] = useState(defaultPreferredContactMethod)
    const [bio, setBio] = useState(defaultBio)
    const [headline, setHeadline] = useState(defaultHeadline)
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(defaultAvatarUrl)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [hasNewAvatar, setHasNewAvatar] = useState(false)

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            setHasNewAvatar(true)
        }
    }

    const panelClass = isLight
        ? 'border-slate-200 bg-white/90 shadow-sm'
        : 'border-slate-800 bg-slate-900/60 shadow-2xl'
    const textMainClass = isLight
        ? 'text-slate-900'
        : 'text-slate-100'
    const inputClass = isLight
        ? 'border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
        : 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
    const selectClass = isLight
        ? 'border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
        : 'border-slate-800 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
    const labelClass = isLight
        ? 'text-slate-500'
        : 'text-slate-400'
    const textMutedClass = isLight
        ? 'text-slate-600'
        : 'text-slate-400'
    const sectionTitleClass = isLight
        ? 'text-slate-900'
        : 'text-slate-100'

    useEffect(() => {
        if (!notice.success) {
            return
        }

        const message = notice.success
        const photoRemoved = /photo removed/i.test(message)
        const photoSaved = /photo saved/i.test(message)
        const photoChanged = photoRemoved || photoSaved

        // Clear transient avatar state, close editors, and show success toast.
        setHasNewAvatar(false)
        setEditingPersonalInfo(false)
        setEditingLocation(false)
        setEditingContacts(false)
        setEditingBio(false)

        if (photoRemoved) {
            setCurrentAvatarUrl('')
            setPreviewUrl(null)
        }

        if (photoSaved && previewUrl) {
            setCurrentAvatarUrl(previewUrl)
        }

        toast.success(photoChanged ? 'Profile photo updated' : 'Profile updated', {
            description: message,
            duration: 3200,
            id: 'profile-update-success',
        })
    }, [notice.success, previewUrl])

    useEffect(() => {
        if (!notice.error) {
            return
        }

        toast.error('Profile update failed', {
            description: notice.error,
            duration: 4200,
            id: 'profile-update-error',
        })
    }, [notice.error])

    return (
        <div className="space-y-8">
            <h1 className={`text-2xl font-bold ${sectionTitleClass}`}>Edit Profile</h1>

            <form action={formAction} className="space-y-8">
            <input type="hidden" name="avatarCurrentUrl" value={currentAvatarUrl} />

            {/* Profile photo */}
            <Card className={`${panelClass} overflow-hidden rounded-2xl`}>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <Avatar className={`h-24 w-24 shrink-0 border-2 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                            <AvatarImage src={previewUrl || currentAvatarUrl} alt="Profile" />
                            <AvatarFallback className={isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'}>
                                {defaultFullName?.trim() ? defaultFullName.trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join('').toUpperCase() || 'U' : 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                            <input
                                id="avatarFile"
                                name="avatarFile"
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={handleAvatarChange}
                                disabled={isPending}
                                className="sr-only"
                            />
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="avatarFile" className="inline-block cursor-pointer">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-xl cursor-pointer"
                                            onClick={() => document.getElementById('avatarFile')?.click()}
                                        >
                                            Upload new photo
                                        </Button>
                                    </label>
                                    {hasNewAvatar && (
                                        <Button
                                            type="submit"
                                            disabled={isPending}
                                            className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                                        >
                                            Save photo
                                        </Button>
                                    )}
                                </div>
                                {defaultAvatarUrl ? (
                                    <button
                                        type="submit"
                                        name="avatarRemove"
                                        value="1"
                                        onClick={(event: MouseEvent<HTMLButtonElement>) => {
                                            if (isPending) return
                                            const confirmed = window.confirm(
                                                'Remove your current photo? You can upload a new one anytime.',
                                            )
                                            if (!confirmed) {
                                                event.preventDefault()
                                                event.stopPropagation()
                                            }
                                        }}
                                        disabled={isPending}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 hover:border-rose-300"
                                        title="Remove photo"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Remove photo</span>
                                    </button>
                                ) : null}
                            </div>
                            <p className={`text-xs ${textMutedClass}`}>At least 800×800 px recommended. JPG or PNG is allowed.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Personal Info */}
            <Card className={`${panelClass} overflow-hidden rounded-2xl`}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <h2 className={`text-base font-semibold ${sectionTitleClass}`}>Personal Info</h2>
                        {!editingPersonalInfo ? (
                            <button type="button" onClick={() => setEditingPersonalInfo(true)} className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium ${textMutedClass} hover:opacity-80`}>
                                <Pencil className="h-4 w-4" /> Edit
                            </button>
                        ) : null}
                    </div>
                    {editingPersonalInfo ? (
                        <div className="mt-4 space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className={`block text-xs font-medium ${labelClass}`}>Full Name</label>
                                    <input
                                        name="fullName"
                                        value={fullName}
                                        onChange={(event) => setFullName(event.target.value)}
                                        className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-xs font-medium ${labelClass}`}>Phone</label>
                                    <input
                                        name="phone"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        placeholder="(219) 555-0114"
                                        className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <label className={`block text-xs font-medium ${labelClass}`}>Headline / Profession</label>
                                <input
                                    name="headline"
                                    value={headline}
                                    onChange={(event) => setHeadline(event.target.value)}
                                    placeholder="e.g. Product Manager at Impactis"
                                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                                />
                            </div>
                            <p className={`text-xs ${textMutedClass}`}>Email is from your account.</p>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => setEditingPersonalInfo(false)} className="rounded-xl">Cancel</Button>
                                <Button type="submit" disabled={isPending} className="rounded-xl bg-blue-600 hover:bg-blue-700">Save changes</Button>
                            </div>
                        </div>
                    ) : (
                        <dl className={`mt-4 space-y-2 text-sm ${textMainClass}`}>
                            <div><span className={textMutedClass}>Full Name: </span>{fullName || '—'}</div>
                            <div><span className={textMutedClass}>Headline / Profession: </span>{headline || '—'}</div>
                            <div><span className={textMutedClass}>Email: </span>{defaultEmail || '—'}</div>
                            <div><span className={textMutedClass}>Phone: </span>{phone || '—'}</div>
                        </dl>
                    )}
                </CardContent>
            </Card>

            {/* Location */}
            <Card className={`${panelClass} overflow-hidden rounded-2xl`}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <h2 className={`text-base font-semibold ${sectionTitleClass}`}>Location</h2>
                        {!editingLocation ? (
                            <button
                                type="button"
                                onClick={() => setEditingLocation(true)}
                                className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium ${textMutedClass} hover:opacity-80`}
                            >
                                <Pencil className="h-4 w-4" /> Edit
                            </button>
                        ) : null}
                    </div>

                    {editingLocation ? (
                        <div className="mt-4 flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-[200px]">
                                <label htmlFor="location" className="sr-only">
                                    Location
                                </label>
                                <div
                                    className={`flex rounded-xl border ${
                                        isLight ? 'border-slate-200 bg-white' : 'border-slate-700 bg-slate-950'
                                    }`}
                                >
                                    <span className={`flex items-center pl-3 ${textMutedClass}`}>
                                        <MapPin className="h-4 w-4" />
                                    </span>
                                    <input
                                        id="location"
                                        name="location"
                                        value={location}
                                        onChange={(event) => setLocation(event.target.value)}
                                        placeholder="e.g. California"
                                        className={`flex-1 border-0 bg-transparent px-3 py-2.5 text-sm outline-none ${textMainClass}`}
                                    />
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setEditingLocation(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                                Save changes
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <span className={textMutedClass}>
                                <MapPin className="h-4 w-4" />
                            </span>
                            <span className={textMainClass}>{location || 'No location set yet.'}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Contact & links */}
            <Card className={`${panelClass} overflow-hidden rounded-2xl`}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <h2 className={`text-base font-semibold ${sectionTitleClass}`}>Contact & links</h2>
                        {!editingContacts ? (
                            <button
                                type="button"
                                onClick={() => setEditingContacts(true)}
                                className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium ${textMutedClass} hover:opacity-80`}
                            >
                                <Pencil className="h-4 w-4" /> Edit
                            </button>
                        ) : null}
                    </div>

                    {editingContacts ? (
                        <div className="mt-4 space-y-4">
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <label className={`block text-xs font-medium ${labelClass}`}>Website URL</label>
                                    <input
                                        name="websiteUrl"
                                        value={websiteUrl}
                                        onChange={(event) => setWebsiteUrl(event.target.value)}
                                        placeholder="https://example.com"
                                        className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-xs font-medium ${labelClass}`}>LinkedIn URL</label>
                                    <input
                                        name="linkedinUrl"
                                        value={linkedinUrl}
                                        onChange={(event) => setLinkedinUrl(event.target.value)}
                                        placeholder="https://www.linkedin.com/in/your-handle"
                                        className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <label className={`block text-xs font-medium ${labelClass}`}>Timezone</label>
                                    <input
                                        name="timezoneName"
                                        value={timezoneName}
                                        onChange={(event) => setTimezoneName(event.target.value)}
                                        placeholder="e.g. Africa/Addis_Ababa"
                                        className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                                    />
                                    <p className={`mt-1 text-[11px] ${textMutedClass}`}>Use IANA format (e.g. Europe/London).</p>
                                </div>
                                <div>
                                    <label className={`block text-xs font-medium ${labelClass}`}>Preferred contact</label>
                                    <select
                                        name="preferredContactMethod"
                                        value={preferredContactMethod}
                                        onChange={(event) => setPreferredContactMethod(event.target.value)}
                                        className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${selectClass}`}
                                    >
                                        <option value="">No preference</option>
                                        <option value="email">Email</option>
                                        <option value="phone">Phone</option>
                                        <option value="linkedin">LinkedIn</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => setEditingContacts(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                                    Save changes
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <dl className={`mt-4 space-y-2 text-sm ${textMainClass}`}>
                            <div>
                                <span className={textMutedClass}>Website: </span>
                                <span>{websiteUrl || '—'}</span>
                            </div>
                            <div>
                                <span className={textMutedClass}>LinkedIn: </span>
                                <span>{linkedinUrl || '—'}</span>
                            </div>
                            <div>
                                <span className={textMutedClass}>Timezone: </span>
                                <span>{timezoneName || '—'}</span>
                            </div>
                            <div>
                                <span className={textMutedClass}>Preferred contact: </span>
                                <span>{toTitleCase(preferredContactMethod) || 'No preference'}</span>
                            </div>
                        </dl>
                    )}
                </CardContent>
            </Card>

            {/* Hidden fields for submit from non-editing sections */}
            {!editingPersonalInfo && <input type="hidden" name="fullName" value={fullName} />}
            {!editingPersonalInfo && <input type="hidden" name="phone" value={phone} />}
            {!editingPersonalInfo && <input type="hidden" name="headline" value={headline} />}
            {!editingLocation && <input type="hidden" name="location" value={location} />}
            {!editingContacts && <input type="hidden" name="websiteUrl" value={websiteUrl} />}
            {!editingContacts && <input type="hidden" name="linkedinUrl" value={linkedinUrl} />}
            {!editingContacts && <input type="hidden" name="timezoneName" value={timezoneName || 'UTC'} />}
            {!editingContacts && <input type="hidden" name="preferredContactMethod" value={preferredContactMethod} />}
            {!editingBio && <input type="hidden" name="bio" value={bio} />}

            {/* Bio */}
            <Card className={`${panelClass} overflow-hidden rounded-2xl`}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <h2 className={`text-base font-semibold ${sectionTitleClass}`}>Bio</h2>
                        {!editingBio ? (
                            <button type="button" onClick={() => setEditingBio(true)} className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium ${textMutedClass} hover:opacity-80`}>
                                <Pencil className="h-4 w-4" /> Edit
                            </button>
                        ) : null}
                    </div>
                    {editingBio ? (
                        <div className="mt-4 space-y-4">
                            <textarea
                                name="bio"
                                value={bio}
                                onChange={(event) => setBio(event.target.value)}
                                rows={4}
                                placeholder="Write a short bio..."
                                className={`w-full resize-none rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                            />
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => setEditingBio(false)} className="rounded-xl">Cancel</Button>
                                <Button type="submit" disabled={isPending} className="rounded-xl bg-blue-600 hover:bg-blue-700">Save changes</Button>
                            </div>
                        </div>
                    ) : (
                        <p className={`mt-4 text-sm leading-relaxed ${textMainClass}`}>
                            {bio && bio.length > 180 ? `${bio.slice(0, 180).trim()}…` : bio || 'No biography provided yet.'}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Status & Actions */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-2">
                <div className="flex-1">
                    {notice.error ? (
                        <ActionFeedback
                            tone="error"
                            title="Profile update failed"
                            message={notice.error}
                            isLight={isLight}
                        />
                    ) : null}
                    {notice.success ? (
                        <ActionFeedback
                            tone="success"
                            title="Profile saved"
                            message={notice.success}
                            isLight={isLight}
                        />
                    ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-4">
                    {/* Per-section Save changes buttons are inside each card */}
                </div>
            </div>
        </form>
        </div>
    )
}
