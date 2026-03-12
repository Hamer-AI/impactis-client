'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Pool } from 'pg'
import { auth } from '@/lib/auth'
import { getPostAuthRedirectPath } from '@/modules/auth'

type QuestionnaireState = {
    error: string | null
}

function normalizeJson(value: string | null): Record<string, unknown> {
    if (!value) return {}
    try {
        const parsed = JSON.parse(value)
        return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
    } catch {
        return {}
    }
}

function getPool(): Pool {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not configured')
    }
    const pool = new Pool({ connectionString: databaseUrl })
    pool.on('connect', (client) => {
        client.query('SET search_path TO auth, public')
    })
    return pool
}

export async function saveOnboardingQuestionnaireAction(
    _previousState: QuestionnaireState,
    formData: FormData
): Promise<QuestionnaireState> {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    const user = session?.user as any
    if (!user?.id) {
        return { error: 'Your session has expired. Please log in again.' }
    }

    const answersRaw = typeof formData.get('answers') === 'string' ? (formData.get('answers') as string) : null
    const scoreRaw = typeof formData.get('score') === 'string' ? (formData.get('score') as string) : null
    const completedRaw = typeof formData.get('completed') === 'string' ? (formData.get('completed') as string) : null
    const skippedRaw = typeof formData.get('skipped') === 'string' ? (formData.get('skipped') as string) : null

    const answers = normalizeJson(answersRaw)
    const score = scoreRaw ? Math.max(0, Math.min(100, Number(scoreRaw))) : 0
    const completed = completedRaw === 'true'
    const skipped = skippedRaw === 'true'

    const meta = (user.user_metadata ?? {}) as Record<string, unknown>
    const role = (meta.role ?? meta.intended_org_type ?? null) as string | null

    const existingOnboardingData =
        meta.onboardingData && typeof meta.onboardingData === 'object' && meta.onboardingData !== null
            ? (meta.onboardingData as Record<string, unknown>)
            : {}

    const roleKey = typeof role === 'string' && role.trim().length > 0 ? role : 'unknown'
    const existingRoleData =
        existingOnboardingData[roleKey] && typeof existingOnboardingData[roleKey] === 'object'
            ? (existingOnboardingData[roleKey] as Record<string, unknown>)
            : {}

    const nextOnboardingData = {
        ...existingOnboardingData,
        [roleKey]: {
            ...existingRoleData,
            questionnaire: answers,
            score: Number.isFinite(score) ? Math.round(score) : 0,
            updated_at: new Date().toISOString(),
        },
    }

    const onboardingCompleted = completed || skipped
    const nextMeta = {
        ...meta,
        onboardingRole: role,
        onboardingCompleted,
        onboardingSkipped: skipped,
        onboardingStep: onboardingCompleted ? 2 : 1,
        onboardingData: nextOnboardingData,
        onboarding_questionnaire: {
            role,
            completed,
            skipped,
            score: Number.isFinite(score) ? Math.round(score) : 0,
            updated_at: new Date().toISOString(),
            answers,
        },
    }

    const pool = getPool()
    try {
        await pool.query(
            `update auth.users set raw_user_meta_data = $1::jsonb, updated_at = timezone('utc', now()) where id = $2::uuid`,
            [JSON.stringify(nextMeta), user.id]
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to save onboarding answers right now.'
        return { error: message }
    } finally {
        await pool.end()
    }

    if (completed || skipped) {
        redirect(getPostAuthRedirectPath(true, { skipCache: true }))
    }

    return { error: null }
}

