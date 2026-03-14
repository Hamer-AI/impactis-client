'use client'

import { useState } from 'react'
import { createDefaultOrganizationAndRedirect } from './actions'
import { Button } from '@/components/ui/button'

type Props = { inline?: boolean; companyNameFromDb?: string | null }

export default function OnboardingGoToDashboard({ inline, companyNameFromDb }: Props) {
    const [pending, setPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGo = async () => {
        setPending(true)
        setError(null)
        const result = await createDefaultOrganizationAndRedirect(companyNameFromDb ?? undefined)
        if (result?.error) {
            setError(result.error)
            setPending(false)
        }
    }

    if (inline) {
        return (
            <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center">
                {error && <span className="text-xs font-semibold text-rose-600">{error}</span>}
                <button
                    type="button"
                    onClick={handleGo}
                    disabled={pending}
                    className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-70"
                >
                    {pending ? 'Taking you…' : 'Already completed? Go to dashboard'}
                </button>
            </div>
        )
    }

    return (
        <section className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-10 shadow-xl text-center">
            <h1 className="text-2xl font-black text-gray-900">You’re all set</h1>
            <p className="mt-3 text-gray-600">
                Your onboarding is complete. Go to your dashboard to get started.
            </p>
            {error && (
                <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p>
            )}
            <div className="mt-8">
                <Button
                    onClick={handleGo}
                    disabled={pending}
                    className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
                >
                    {pending ? 'Taking you to dashboard…' : 'Go to dashboard'}
                </Button>
            </div>
        </section>
    )
}
