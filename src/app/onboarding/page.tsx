import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Pool } from 'pg'
import { auth } from '@/lib/auth'
import { getPostAuthRedirectPath } from '@/modules/auth'
import {
    hasOrganizationMembershipForUser,
    mapAppRoleToOrganizationType,
    type OrganizationType,
} from '@/modules/organizations'
import OnboardingForm from './OnboardingForm'
import OnboardingGoToDashboard from './OnboardingGoToDashboard'

function getPool(): Pool {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) throw new Error('DATABASE_URL is not configured')
    const pool = new Pool({ connectionString: databaseUrl })
    pool.on('connect', (client) => {
        client.query('SET search_path TO public')
    })
    return pool
}

async function getOnboardingCompletedFromDb(userId: string): Promise<{ completed: boolean; hasCompanyName: boolean; companyName: string | null }> {
    let pool: Pool | null = null
    try {
        pool = getPool()
        const progressRows = await pool.query<{ is_completed: boolean }>(
            `select is_completed from public.user_onboarding_progress where user_id = $1::uuid limit 1`,
            [userId]
        )
        if (progressRows.rows[0]?.is_completed === true) {
            const detailsRows = await pool.query<{ details: unknown }>(
                `select details from public.user_onboarding_details where user_id = $1::uuid limit 3`,
                [userId]
            )
            for (const row of detailsRows.rows) {
                if (row?.details && typeof row.details === 'object' && !Array.isArray(row.details)) {
                    const name = (row.details as Record<string, unknown>).companyName
                    if (typeof name === 'string' && name.trim().length >= 2) {
                        return { completed: true, hasCompanyName: true, companyName: name.trim() }
                    }
                }
            }
            return { completed: true, hasCompanyName: false, companyName: null }
        }
        const detailsRows = await pool.query<{ details: unknown }>(
            `select details from public.user_onboarding_details where user_id = $1::uuid limit 3`,
            [userId]
        )
        for (const row of detailsRows.rows) {
            if (row?.details && typeof row.details === 'object' && !Array.isArray(row.details)) {
                const name = (row.details as Record<string, unknown>).companyName
                if (typeof name === 'string' && name.trim().length >= 2) {
                    return { completed: false, hasCompanyName: true, companyName: name.trim() }
                }
            }
        }
    } catch {
        /* ignore */
    } finally {
        if (pool) {
            try {
                await pool.end()
            } catch {
                /* ignore */
            }
        }
    }
    return { completed: false, hasCompanyName: false, companyName: null }
}

function resolveDefaultOrganizationType(value: unknown): OrganizationType {
    return mapAppRoleToOrganizationType(value) ?? 'startup'
}

function normalizeText(value: unknown): string {
    if (typeof value !== 'string') {
        return ''
    }

    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : ''
}

function normalizeTextArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return []
    }

    return value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
}

export default async function OnboardingPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect('/auth/login')
    }

    const user = session.user as any

    const hasMembership = await hasOrganizationMembershipForUser(null as any, user, {
        // Fail closed to prevent redirect loops when the organizations API is unavailable.
        failOpenOnRequestError: false,
    })
    if (hasMembership) {
        redirect(getPostAuthRedirectPath(true, { skipCache: true }))
    }

    const metadata = user.user_metadata as Record<string, unknown> | undefined
    const role = (typeof metadata?.role === 'string' ? metadata.role : metadata?.intended_org_type) ?? 'startup'
    const onboardingData = metadata?.onboardingData && typeof metadata.onboardingData === 'object' ? (metadata.onboardingData as Record<string, unknown>) : {}
    const roleData = onboardingData[role] && typeof onboardingData[role] === 'object' ? (onboardingData[role] as Record<string, unknown>) : {}
    const fromMetadata = metadata?.onboardingCompleted === true || (typeof roleData.companyName === 'string' && roleData.companyName.trim().length >= 2)

    const fromDb = await getOnboardingCompletedFromDb(user.id)
    const showGoToDashboard = fromMetadata || fromDb.completed || fromDb.hasCompanyName

    if (showGoToDashboard) {
        const dbCompanyName = fromDb.companyName ?? null
        return (
            <main className="min-h-screen bg-gray-50 px-4 py-20 flex items-center justify-center">
                <OnboardingGoToDashboard companyNameFromDb={dbCompanyName} />
            </main>
        )
    }

    const metadataOrgType = metadata?.intended_org_type
    const metadataRole = metadata?.role
    const metadataCompany = metadata?.company
    const metadataLocation = metadata?.location
    const metadataIndustryTags = metadata?.industry_tags

    const defaultOrganizationType = resolveDefaultOrganizationType(metadataOrgType ?? metadataRole)
    const defaultOrganizationName = normalizeText(metadataCompany)
    const defaultLocation = normalizeText(metadataLocation)
    const defaultIndustryTags = normalizeTextArray(metadataIndustryTags)

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-20">
            <section className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-10 shadow-xl">
                <h1 className="text-3xl font-black text-gray-900">Finish your onboarding</h1>
                <p className="mt-3 text-gray-600">
                    Your account is active. Create your first organization to unlock the workspace.
                </p>
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                    <p className="text-sm font-semibold text-emerald-800">
                        You can always update details later. For now we need your org identity and type.
                    </p>
                </div>

                <OnboardingForm
                    defaultOrganizationType={defaultOrganizationType}
                    defaultOrganizationName={defaultOrganizationName}
                    defaultLocation={defaultLocation}
                    defaultIndustryTags={Array.from(new Set(defaultIndustryTags))}
                />

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Back To Home
                        </Link>
                        <form action="/auth/signout" method="post" className="w-full sm:w-auto">
                            <button
                                type="submit"
                                className="inline-flex w-full items-center justify-center rounded-xl bg-[#0B3D2E] px-5 py-3 font-semibold text-white hover:bg-[#082a20]"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>
                    <OnboardingGoToDashboard inline />
                </div>
            </section>
        </main>
    )
}
