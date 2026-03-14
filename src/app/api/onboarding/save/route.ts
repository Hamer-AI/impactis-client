import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Pool } from 'pg'
import { auth } from '@/lib/auth'

type SaveOnboardingPayload = {
    role: string
    stepIndex: number
    totalSteps?: number
    values: Record<string, unknown>
    completed?: boolean
    skipped?: boolean
}

function getPool(): Pool {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not configured')
    }
    const pool = new Pool({ connectionString: databaseUrl })
    pool.on('connect', (client) => {
        client.query('SET search_path TO public')
    })
    return pool
}

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })
        const user = session?.user as any
        if (!user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const body = (await request.json()) as SaveOnboardingPayload
        const role = typeof body.role === 'string' ? body.role.trim() : ''
        const stepIndex = Number.isFinite(body.stepIndex) ? body.stepIndex : 0
        const totalSteps = Number.isFinite(body.totalSteps) && body.totalSteps! > 0 ? Math.min(20, Math.round(body.totalSteps!)) : 6
        const completed = body.completed === true
        const skipped = body.skipped === true
        const values = body.values && typeof body.values === 'object' && body.values !== null ? body.values : {}

        const meta = (user.user_metadata ?? {}) as Record<string, unknown>
        const existingOnboardingData =
            meta.onboardingData && typeof meta.onboardingData === 'object' && meta.onboardingData !== null
                ? (meta.onboardingData as Record<string, unknown>)
                : {}

        const roleKey = role || (meta.role as string | undefined) || (meta.intended_org_type as string | undefined) || 'unknown'
        const existingRoleData =
            existingOnboardingData[roleKey] && typeof existingOnboardingData[roleKey] === 'object'
                ? (existingOnboardingData[roleKey] as Record<string, unknown>)
                : {}

        const nextRoleData = {
            ...existingRoleData,
            ...values,
            updated_at: new Date().toISOString(),
        }

        const onboardingCompleted = completed || skipped
        const safeScore =
            typeof (meta as any)?.onboarding_questionnaire?.score === 'number'
                ? Number.isFinite((meta as any).onboarding_questionnaire.score)
                    ? Math.round((meta as any).onboarding_questionnaire.score)
                    : 0
                : 0
        const nextMeta = {
            ...meta,
            onboardingRole: roleKey,
            onboardingCompleted,
            onboardingSkipped: skipped,
            onboardingStep: onboardingCompleted ? stepIndex : stepIndex,
            onboardingData: {
                ...existingOnboardingData,
                [roleKey]: nextRoleData,
            },
            // Keep legacy questionnaire shape in sync so existing gating logic
            // in /onboarding/questions/page.tsx can redirect users who have
            // completed or skipped onboarding.
            onboarding_questionnaire: {
                ...(typeof (meta as any).onboarding_questionnaire === 'object'
                    ? ((meta as any).onboarding_questionnaire as Record<string, unknown>)
                    : {}),
                role: roleKey,
                completed: onboardingCompleted,
                skipped,
                score: safeScore,
                updated_at: new Date().toISOString(),
            },
        }

        const pool = getPool()
        try {
            await pool.query(
                `update public.users set raw_user_meta_data = $1::jsonb, updated_at = timezone('utc', now()) where id = $2::uuid`,
                [JSON.stringify(nextMeta), user.id]
            )
            const orgType = roleKey === 'startup' ? 'startup' : roleKey === 'investor' ? 'investor' : 'advisor'
            const completedStages = onboardingCompleted ? totalSteps : Math.min(totalSteps, Math.max(0, stepIndex + 1))
            try {
                await pool.query(
                    `
                    insert into public.user_onboarding_progress (user_id, organization_type, total_stages, completed_stages, is_completed, completed_at, updated_at)
                    values ($1::uuid, $2::text, $3::smallint, $4::smallint, $5::boolean, $6::timestamptz, timezone('utc', now()))
                    on conflict (user_id, organization_type) do update set
                      total_stages = excluded.total_stages,
                      completed_stages = excluded.completed_stages,
                      is_completed = excluded.is_completed,
                      completed_at = excluded.completed_at,
                      updated_at = timezone('utc', now())
                    `,
                    [
                        user.id,
                        orgType,
                        totalSteps,
                        completedStages,
                        onboardingCompleted,
                        onboardingCompleted ? new Date().toISOString() : null,
                    ]
                )
            } catch {
                // Table may not exist yet; metadata save already succeeded
            }
            try {
                await pool.query(
                    `
                    insert into public.user_onboarding_details (user_id, organization_type, details, updated_at)
                    values ($1::uuid, $2::text, $3::jsonb, timezone('utc', now()))
                    on conflict (user_id, organization_type) do update set
                      details = excluded.details,
                      updated_at = timezone('utc', now())
                    `,
                    [user.id, orgType, JSON.stringify(nextRoleData)]
                )
            } catch {
                // Table may not exist yet
            }
        } finally {
            await pool.end()
        }

        return NextResponse.json({
            ok: true,
            onboardingCompleted,
            onboardingSkipped: skipped,
            onboardingStep: stepIndex,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to save onboarding data right now.'
        return NextResponse.json({ message }, { status: 500 })
    }
}

