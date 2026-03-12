import { z } from 'zod'

export const BUSINESS_TYPE_OPTIONS = [
    'Independent',
    'Small firm (2-5)',
    'Boutique (6-20)',
    'Mid-size (21-50)',
    'Large (50+)',
] as const

export const YEARS_CONSULTING_OPTIONS = ['< 2 yrs', '2-5 yrs', '5-10 yrs', '10-20 yrs', '20+ yrs'] as const

export const PREVIOUS_EXPERIENCE_OPTIONS = [
    'Former Founder',
    'Corporate Executive',
    'VC/PE',
    'Career Consultant',
    'Academic',
    'Angel Investor',
    'Other',
] as const

export const COMPETENCY_OPTIONS = [
    'Strategy',
    'Fundraising',
    'GTM/Sales',
    'Product',
    'Technology/Engineering',
    'Operations',
    'Finance/CFO',
    'Legal/Compliance',
    'Marketing/Brand',
    'HR/People',
    'International Expansion',
    'Other',
] as const

export const CLIENT_TYPES_SERVED = ['Pre-seed', 'Seed', 'Series A-B', 'Growth-stage', 'Enterprise', 'Non-profit', 'Government'] as const

export const PREFERRED_STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth', 'Enterprise'] as const

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

export const ENGAGEMENT_LENGTH_OPTIONS = ['One-time project', '1-3 months', '3-6 months', '6-12 months', 'Ongoing retainer'] as const

const advisorOnboardingBaseSchema = z.object({
        // Step 1
        businessType: z.enum(BUSINESS_TYPE_OPTIONS),
        yearsConsulting: z.enum(YEARS_CONSULTING_OPTIONS),
        previousExperience: z.array(z.enum(PREVIOUS_EXPERIENCE_OPTIONS)).max(10).optional().default([]),

        // Step 2 (rank 1-3 no duplicates)
        competencyRank1: z.enum(COMPETENCY_OPTIONS).optional().nullable(),
        competencyRank2: z.enum(COMPETENCY_OPTIONS).optional().nullable(),
        competencyRank3: z.enum(COMPETENCY_OPTIONS).optional().nullable(),

        // Step 3 (simple version: checkboxes + numeric fields)
        strategicConsulting: z.boolean().optional().default(false),
        strategicHourlyRateUsd: z.coerce.number().min(0).optional().nullable(),
        strategicProjectRangeMinUsd: z.coerce.number().min(0).optional().nullable(),
        strategicProjectRangeMaxUsd: z.coerce.number().min(0).optional().nullable(),

        fractionalExecutive: z.boolean().optional().default(false),
        fractionalMonthlyRetainerUsd: z.coerce.number().min(0).optional().nullable(),
        fractionalHoursPerWeek: z.enum(['2-5', '5-10', '10-20', '20+']).optional().nullable(),

        advisoryBoardSeat: z.boolean().optional().default(false),
        boardEquityPercent: z.coerce.number().min(0).max(100).optional().nullable(),
        boardCashRetainerUsd: z.coerce.number().min(0).optional().nullable(),

        workshopTraining: z.boolean().optional().default(false),
        workshopDayRateUsd: z.coerce.number().min(0).optional().nullable(),

        otherModel: z.boolean().optional().default(false),
        otherModelDescription: z.string().max(500).optional().nullable(),

        // Step 4
        clientTypesServed: z.array(z.enum(CLIENT_TYPES_SERVED)).max(20).optional().default([]),
        notableClients: z
            .array(
                z.object({
                    name: z.string().min(1).max(120),
                    industry: z.string().max(80).optional().nullable(),
                    stage: z.string().max(80).optional().nullable(),
                    outcome: z.string().max(300).optional().nullable(),
                }),
            )
            .max(5)
            .optional()
            .default([]),
        revenueGrowthUsd: z.coerce.number().min(0).optional().nullable(),
        fundingRaisedUsd: z.coerce.number().min(0).optional().nullable(),
        clientsServedCount: z.coerce.number().int().min(0).optional().nullable(),

        // Step 5
        stageMatch: z
            .record(
                z.object({
                    workWith: z.boolean().optional().default(false),
                    preference: z.enum(['Preferred', 'OK', 'Last resort']).optional().nullable(),
                    minProjectSizeUsd: z.coerce.number().min(0).optional().nullable(),
                }),
            )
            .optional()
            .default({}),
        preferredIndustries: z.array(z.enum(SECTORS)).max(5).optional().default([]),
        preferredGeography: z.array(z.enum(REGIONS)).max(20).optional().default([]),
        engagementLengthPreference: z.enum(ENGAGEMENT_LENGTH_OPTIONS).optional().nullable(),
    })

export const advisorOnboardingSchema = advisorOnboardingBaseSchema.superRefine((v, ctx) => {
        const ranks = [v.competencyRank1, v.competencyRank2, v.competencyRank3].filter(Boolean) as string[]
        const set = new Set(ranks)
        if (set.size !== ranks.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['competencyRank2'],
                message: 'Competency ranks must be unique.',
            })
        }
    })

export type AdvisorOnboardingValues = z.infer<typeof advisorOnboardingSchema>

