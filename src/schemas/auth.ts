import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const signupSchema = z.object({
    role: z.enum(['founder', 'investor', 'advisor']).optional(),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(1, 'Full name is required').max(200, 'Name is too long'),
})

export type SignupFormValues = z.infer<typeof signupSchema>

export const verifyEmailSchema = z.object({
    otpCode: z.string().length(6, 'Enter the full 6-digit code'),
})

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>

export const resetPasswordSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export const updatePasswordSchema = z
    .object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'New passwords do not match',
        path: ['confirmPassword'],
    })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
