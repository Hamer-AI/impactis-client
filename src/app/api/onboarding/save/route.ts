import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { resolveApiBaseUrl } from '@/lib/api/rest-client'
import { getBetterAuthToken } from '@/lib/better-auth-token'

type SaveOnboardingPayload = {
    role: string
    stepIndex: number
    totalSteps?: number
    values: Record<string, unknown>
    completed?: boolean
    skipped?: boolean
}

type MembershipResponse = {
    organization?: {
        type?: string | null
    } | null
} | null

type OnboardingMutationResponse = {
    success?: boolean
    error?: string
}

function normalizeText(value: unknown): string | null {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

function normalizeNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(value.trim())
        return Number.isFinite(parsed) ? parsed : null
    }
    return null
}

function normalizeOnboardingValues(role: string, rawValues: Record<string, unknown>): Record<string, unknown> {
    const values = { ...rawValues }

    if (role === 'startup') {
        const companyName = normalizeText(values.companyName)
        const websiteUrl = normalizeText(values.websiteUrl)
        const companyStage = normalizeText(values.companyStage)
        const industry = normalizeText(values.industry)
        const countryOfIncorporation = normalizeText(values.countryOfIncorporation)
        const elevatorPitch = normalizeText(values.elevatorPitch)
        const problemStatement = normalizeText(values.problemStatement)
        const solution = normalizeText(values.solution)
        const uniqueValueProposition = normalizeText(values.uniqueValueProposition)

        return {
            ...values,
            company_name: companyName,
            legal_name: companyName,
            trading_name: companyName,
            website_url: websiteUrl,
            company_stage: companyStage,
            company_stage_band: companyStage,
            primary_industry: industry,
            country_of_incorporation: countryOfIncorporation,
            elevator_pitch: elevatorPitch,
            problem_statement: problemStatement,
            solution_statement: solution,
            unique_advantage: uniqueValueProposition,
            waitlist_count: normalizeNumber(values.waitlistSize),
            revenue_growth_rate_mom_pct: normalizeNumber(values.momGrowthPercent),
            mrr_usd: normalizeNumber(values.mrrUsd),
            cac_usd: normalizeNumber(values.cacUsd),
            ltv_usd: normalizeNumber(values.ltvUsd),
            churn_rate_pct: normalizeNumber(values.churnRatePercent),
            total_paying_customers: normalizeNumber(values.totalCustomers),
            co_founders_count: normalizeNumber(values.numberOfFounders),
            round_type: normalizeText(values.fundingRoundType),
            target_raise_usd: normalizeNumber(values.amountRaisingUsd),
            committed_so_far_usd: normalizeNumber(values.amountCommittedUsd),
        }
    }

    if (role === 'investor') {
        return {
            ...values,
            investing_years_band: normalizeText(values.investingYears),
            total_investments_made_band: normalizeText(values.totalStartupInvestments),
            notable_exits: normalizeText(values.notableExits),
            check_size_band: normalizeText(values.typicalCheckSize),
            total_investable_capital_band: normalizeText(values.investableCapital12mo),
            new_investments_12mo_band: normalizeText(values.investmentsPlanned),
            investment_structures: Array.isArray(values.preferredStructure) ? values.preferredStructure : [],
            stage_preferences: values.stagePreference ?? {},
            startup_maturity_preference: Array.isArray(values.maturityIndicators) ? values.maturityIndicators : [],
            industry_preferences: {
                primaryIndustries: Array.isArray(values.primaryIndustries) ? values.primaryIndustries : [],
                industryMatrix: values.industryMatrix ?? {},
            },
            geographic_regions: Array.isArray(values.targetRegions) ? values.targetRegions : [],
            remote_team_openness: normalizeText(values.remoteTeamPreference),
            investment_approach: normalizeText(values.investmentStyle),
            value_add_offerings: Array.isArray(values.valueAddBeyondCapital) ? values.valueAddBeyondCapital : [],
            diversity_priority: normalizeText(values.founderDiversityFocus),
        }
    }

    return {
        ...values,
        business_type: normalizeText(values.businessType),
        years_in_consulting_band: normalizeText(values.yearsConsulting),
        previous_experience_types: Array.isArray(values.previousExperience) ? values.previousExperience : [],
        primary_expertise_areas: [
            normalizeText(values.competencyRank1),
            normalizeText(values.competencyRank2),
            normalizeText(values.competencyRank3),
        ].filter(Boolean),
        client_types: Array.isArray(values.clientTypesServed) ? values.clientTypesServed : [],
        notable_clients: Array.isArray(values.notableClients) ? values.notableClients : [],
        revenue_growth_driven_usd: normalizeNumber(values.revenueGrowthUsd),
        funding_raised_for_clients: normalizeNumber(values.fundingRaisedUsd),
        total_clients_served: normalizeNumber(values.clientsServedCount),
        geographic_pref: Array.isArray(values.preferredGeography) ? values.preferredGeography : [],
        engagement_length_pref: normalizeText(values.engagementLengthPreference),
        case_studies: Array.isArray(values.notableClients) ? values.notableClients : [],
    }
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
        const rawValues = body.values && typeof body.values === 'object' && body.values !== null ? body.values : {}

        const onboardingCompleted = completed || skipped

        const token = await getBetterAuthToken()
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }
        const apiBaseUrl = resolveApiBaseUrl(process.env.NEXT_PUBLIC_IMPACTIS_API_URL)
        if (!apiBaseUrl) {
            return NextResponse.json({ message: 'API URL not configured' }, { status: 502 })
        }

        // Use the actual org membership type, not stale auth metadata.
        const membershipRes = await fetch(`${apiBaseUrl}/organizations/me/membership`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })
        const membershipJson = membershipRes.ok
            ? ((await membershipRes.json()) as MembershipResponse)
            : null
        const membershipRole = membershipJson?.organization?.type
        const roleKey =
            membershipRole === 'startup' || membershipRole === 'investor' || membershipRole === 'advisor'
                ? membershipRole
                : role || 'startup'
        const values = normalizeOnboardingValues(roleKey, rawValues)

        console.log(
            '[onboarding-save][next]',
            JSON.stringify({
                userId: user.id,
                role,
                roleKey,
                stepIndex,
                completed,
                skipped,
                rawKeys: Object.keys(rawValues),
                rawValues,
                normalizedValues: values,
            })
        )

        const step1Res = await fetch(`${apiBaseUrl}/onboarding/step1`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                role: roleKey,
                values,
            }),
            cache: 'no-store',
        })
        const step1Json = (await step1Res.json().catch(() => null)) as OnboardingMutationResponse | null
        console.log('[onboarding-save][next][step1-response]', JSON.stringify({ status: step1Res.status, body: step1Json }))
        if (!step1Res.ok || step1Json?.success !== true) {
            return NextResponse.json(
                { message: step1Json?.error || `Step1 API returned ${step1Res.status}` },
                { status: step1Res.ok ? 400 : step1Res.status }
            )
        }

        const answersRes = await fetch(`${apiBaseUrl}/onboarding/answers`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                role: roleKey,
                answers: values,
                completed: onboardingCompleted,
                skipped,
                score: 0,
            }),
            cache: 'no-store',
        })
        const answersJson = (await answersRes.json().catch(() => null)) as OnboardingMutationResponse | null
        console.log('[onboarding-save][next][answers-response]', JSON.stringify({ status: answersRes.status, body: answersJson }))
        if (!answersRes.ok || answersJson?.success !== true) {
            return NextResponse.json(
                { message: answersJson?.error || `Answers API returned ${answersRes.status}` },
                { status: answersRes.ok ? 400 : answersRes.status }
            )
        }

        const progressRes = await fetch(`${apiBaseUrl}/onboarding/progress`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                stepKey: 'wizard',
                stepNumber: Math.max(1, stepIndex + 1),
                status: onboardingCompleted ? 'completed' : 'in_progress',
            }),
            cache: 'no-store',
        })
        const progressJson = (await progressRes.json().catch(() => null)) as OnboardingMutationResponse | null
        console.log('[onboarding-save][next][progress-response]', JSON.stringify({ status: progressRes.status, body: progressJson }))
        if (!progressRes.ok || progressJson?.success !== true) {
            return NextResponse.json(
                { message: progressJson?.error || `Progress API returned ${progressRes.status}` },
                { status: progressRes.ok ? 400 : progressRes.status }
            )
        }

        return NextResponse.json({
            ok: true,
            onboardingCompleted,
            onboardingSkipped: skipped,
            onboardingStep: stepIndex,
            role: roleKey,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to save onboarding data right now.'
        return NextResponse.json({ message }, { status: 500 })
    }
}

