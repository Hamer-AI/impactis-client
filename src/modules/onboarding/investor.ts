import { z } from 'zod'

export const INVESTING_YEARS_OPTIONS = ['< 1 yr', '1-3 yrs', '3-5 yrs', '5-10 yrs', '10+ yrs'] as const
export const TOTAL_INVESTMENTS_OPTIONS = ['0', '1-5', '6-15', '16-30', '31-50', '50+'] as const

export const CHECK_SIZE_OPTIONS = ['$5K', '$10K', '$25K', '$50K', '$100K', '$250K', '$500K', '$1M', '$2.5M', '$5M', '$10M+'] as const
export const INVESTABLE_CAPITAL_OPTIONS = ['Under $100K', '$100K–$500K', '$500K–$1M', '$1M–$5M', '$5M–$10M', '$10M–$50M', '$50M+'] as const
export const INVESTMENTS_PLANNED_OPTIONS = ['1-2', '3-5', '6-10', '11-20', '20+'] as const
export const PREFERRED_STRUCTURE_OPTIONS = ['Equity', 'SAFE', 'Convertible Note', 'Revenue Share', 'Token/SAFT', 'SPV', 'Other'] as const

export const STAGE_LABELS = ['Pre-seed (Idea)', 'Seed', 'Series A'] as const

export const MATURITY_INDICATORS = [
    'Pre-revenue',
    'Early revenue (<$10K MRR)',
    'Growing revenue ($10K–$100K MRR)',
    'Scaling ($100K+ MRR)',
    'Profitable',
] as const

export const SECTORS = [
    'FinTech',
    'HealthTech',
    'EdTech',
    'CleanTech',
    'SaaS/B2B',
    'Consumer',
    'DeepTech',
    'Web3/Crypto',
    'Marketplace',
    'Hardware',
    'AI/ML',
    'Cybersecurity',
    'PropTech',
    'Other',
] as const

export const REGIONS = [
    'North America',
    'Europe',
    'Latin America',
    'Southeast Asia',
    'Middle East & Africa',
    'South Asia',
    'East Asia',
    'Global/Remote-first',
] as const

export const REMOTE_TEAM_OPTIONS = ['Fully remote OK', 'Hybrid preferred', 'Physical HQ required', 'Local market only'] as const

export const INVESTMENT_STYLE_OPTIONS = [
    'Hands-on operator',
    'Strategic advisor',
    'Passive/financial only',
    'Lead investor',
    'Co-investor/Follow-on',
] as const

export const VALUE_ADD_OPTIONS = [
    'Mentorship',
    'Fundraising introductions',
    'Recruiting',
    'BD & partnerships',
    'PR & media',
    'Legal/compliance',
    'Product feedback',
    'Board seat',
    'None',
] as const

export const DIVERSITY_FOCUS_OPTIONS = [
    '1 – Actively seeking diverse founders',
    '2 – Positive consideration given',
    '3 – Not a factor in my decisions',
] as const

export const investorOnboardingSchema = z.object({
    // Step 1
    investingYears: z.enum(INVESTING_YEARS_OPTIONS),
    totalStartupInvestments: z.enum(TOTAL_INVESTMENTS_OPTIONS),
    notableExits: z.string().max(2000).optional().nullable(),

    // Step 2
    typicalCheckSize: z.enum(CHECK_SIZE_OPTIONS).optional().nullable(),
    investableCapital12mo: z.enum(INVESTABLE_CAPITAL_OPTIONS).optional().nullable(),
    investmentsPlanned: z.enum(INVESTMENTS_PLANNED_OPTIONS).optional().nullable(),
    preferredStructure: z.array(z.enum(PREFERRED_STRUCTURE_OPTIONS)).max(10).optional().default([]),

    // Step 3
    stagePreference: z
        .object({
            preSeedInterest: z.coerce.number().int().min(1).max(5).optional().nullable(),
            preSeedPercent: z.coerce.number().min(0).max(100).optional().nullable(),
            seedInterest: z.coerce.number().int().min(1).max(5).optional().nullable(),
            seedPercent: z.coerce.number().min(0).max(100).optional().nullable(),
            seriesAInterest: z.coerce.number().int().min(1).max(5).optional().nullable(),
            seriesAPercent: z.coerce.number().min(0).max(100).optional().nullable(),
        })
        .optional()
        .default({}),
    maturityIndicators: z.array(z.enum(MATURITY_INDICATORS)).max(10).optional().default([]),

    // Step 4
    primaryIndustries: z.array(z.enum(SECTORS)).max(5).optional().default([]),
    industryMatrix: z
        .record(z.enum(['must', 'open', 'no']))
        .optional()
        .default({}),

    // Step 5
    targetRegions: z.array(z.enum(REGIONS)).max(10).optional().default([]),
    remoteTeamPreference: z.enum(REMOTE_TEAM_OPTIONS).optional().nullable(),

    // Step 6
    investmentStyle: z.enum(INVESTMENT_STYLE_OPTIONS).optional().nullable(),
    valueAddBeyondCapital: z.array(z.enum(VALUE_ADD_OPTIONS)).max(20).optional().default([]),
    founderDiversityFocus: z.enum(DIVERSITY_FOCUS_OPTIONS).optional().nullable(),
})

export type InvestorOnboardingValues = z.infer<typeof investorOnboardingSchema>

