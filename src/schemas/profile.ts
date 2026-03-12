import { z } from 'zod'

const preferredContactMethod = z.enum(['email', 'phone', 'linkedin']).optional().nullable()

export const profileFormSchema = z.object({
    fullName: z.string().min(0).max(200).optional().nullable(),
    phone: z.string().min(0).max(50).optional().nullable(),
    location: z.string().min(0).max(200).optional().nullable(),
    headline: z.string().min(0).max(200).optional().nullable(),
    websiteUrl: z.string().max(500).optional(),
    linkedinUrl: z.string().max(500).optional(),
    timezoneName: z.string().min(0).max(100).optional().nullable(),
    preferredContactMethod,
    bio: z.string().min(0).max(5000).optional().nullable(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
