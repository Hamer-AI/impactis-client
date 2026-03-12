import { z } from 'zod'

export const onboardingSchema = z.object({
    organizationType: z.enum(['startup', 'investor', 'advisor']),
    organizationName: z.string().min(1, 'Organization name is required').max(200),
    organizationLocation: z.string().min(0).max(200).optional(),
    organizationIndustryTags: z.string().min(0).max(500).optional(),
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>
