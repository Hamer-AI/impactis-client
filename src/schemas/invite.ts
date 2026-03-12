import { z } from 'zod'

export const acceptInviteSchema = z.object({
    inviteToken: z.string().min(1, 'Invite token is required'),
})

export type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>
