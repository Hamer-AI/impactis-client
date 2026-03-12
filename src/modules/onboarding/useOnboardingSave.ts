import { useCallback } from 'react'

type SaveOptions = {
    role: string
    stepIndex: number
    values: Record<string, unknown>
    completed?: boolean
    skipped?: boolean
}

export function useOnboardingSave() {
    return useCallback(async (options: SaveOptions) => {
        const res = await fetch('/api/onboarding/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        })

        if (!res.ok) {
            // Best-effort: surface error in console; caller can choose to show a toast.
            const text = await res.text()
            // eslint-disable-next-line no-console
            console.warn('Failed to save onboarding data:', text)
            return { ok: false as const }
        }

        const json = (await res.json()) as {
            ok?: boolean
            onboardingCompleted?: boolean
            onboardingSkipped?: boolean
            onboardingStep?: number
        }

        return {
            ok: json.ok === true,
            onboardingCompleted: json.onboardingCompleted === true,
            onboardingSkipped: json.onboardingSkipped === true,
            onboardingStep: typeof json.onboardingStep === 'number' ? json.onboardingStep : undefined,
        }
    }, [])
}

