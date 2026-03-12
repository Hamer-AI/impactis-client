import { z } from 'zod'

export const STARTUP_STAGE_OPTIONS = [
    'Pre-idea',
    'Idea/MVP',
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B+',
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

export const startupOnboardingSchema = z.object({
    // Step 1
    companyName: z.string().min(2, 'Company name is required').max(200),
    websiteUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
    companyStage: z.enum(STARTUP_STAGE_OPTIONS),
    industry: z.enum(SECTORS),
    countryOfIncorporation: z.string().min(2).max(80),

    // Step 2
    elevatorPitch: z.string().max(140).optional().nullable(),
    problemStatement: z.string().max(500).optional().nullable(),
    solution: z.string().max(500).optional().nullable(),
    uniqueValueProposition: z.string().max(200).optional().nullable(),

    // Step 3
    tam: z.coerce.number().min(0).optional().nullable(),
    sam: z.coerce.number().min(0).optional().nullable(),
    som: z.coerce.number().min(0).optional().nullable(),
    marketUnit: z.enum(['$M', '$B']).optional().nullable(),
    competitiveLandscape: z.string().max(500).optional().nullable(),

    // Step 4 (store both pre-revenue and revenue metrics; UI will show by stage)
    waitlistSize: z.coerce.number().min(0).optional().nullable(),
    betaTesters: z.coerce.number().min(0).optional().nullable(),
    userGrowthMomPercent: z.coerce.number().min(0).max(1000).optional().nullable(),
    lettersOfIntent: z.coerce.number().min(0).optional().nullable(),

    mrrUsd: z.coerce.number().min(0).optional().nullable(),
    momGrowthPercent: z.coerce.number().min(0).max(1000).optional().nullable(),
    cacUsd: z.coerce.number().min(0).optional().nullable(),
    ltvUsd: z.coerce.number().min(0).optional().nullable(),
    churnRatePercent: z.coerce.number().min(0).max(100).optional().nullable(),
    totalCustomers: z.coerce.number().min(0).optional().nullable(),

    // Step 5
    numberOfFounders: z.coerce.number().int().min(1).max(20).optional().nullable(),
    teamEngineering: z.coerce.number().int().min(0).max(10000).optional().nullable(),
    teamSales: z.coerce.number().int().min(0).max(10000).optional().nullable(),
    teamMarketing: z.coerce.number().int().min(0).max(10000).optional().nullable(),
    teamOperations: z.coerce.number().int().min(0).max(10000).optional().nullable(),
    teamDesign: z.coerce.number().int().min(0).max(10000).optional().nullable(),
    teamOther: z.coerce.number().int().min(0).max(10000).optional().nullable(),

    // Step 6 (uploads optional, store URLs/keys as strings)
    fundingRoundType: z.string().max(80).optional().nullable(),
    amountRaisingUsd: z.coerce.number().min(0).optional().nullable(),
    amountCommittedUsd: z.coerce.number().min(0).optional().nullable(),
})

export type StartupOnboardingValues = z.infer<typeof startupOnboardingSchema>

