'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
import TurnstileWidget from '@/components/auth/TurnstileWidget'
import Link from 'next/link'
import { toast } from 'sonner'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/schemas/auth'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '0x4AAAAAACd7X251ebzrdbGy'
const CAPTCHA_REQUIRED = process.env.NODE_ENV === 'production'

export default function ResetPasswordPage() {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const [captchaResetSignal, setCaptchaResetSignal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { email: '' },
    })

    const onSubmit = async (values: ResetPasswordFormValues) => {
        if (CAPTCHA_REQUIRED && !captchaToken) {
            toast.error('Please complete the security check.')
            return
        }
        setIsLoading(true)
        try {
            const { error } = await authClient.requestPasswordReset({
                email: values.email,
                redirectTo: `${window.location.origin}/auth/update-password`,
                fetchOptions: {
                    headers: {
                        ...(captchaToken ? { 'x-captcha-response': captchaToken } : {}),
                    },
                },
            })
            if (error) {
                toast.error(error.message ?? 'Unable to send reset link.')
                setCaptchaResetSignal((c) => c + 1)
                return
            }
            toast.success('Reset link sent to your email!')
            setIsSent(true)
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold text-[#0B3D2E]">
                        Impactis
                    </Link>
                    <h1 className="mt-4 text-2xl font-semibold text-gray-900">Reset Password</h1>
                    <p className="mt-2 text-gray-600">Enter your email for a password reset link</p>
                </div>

                {isSent ? (
                    <div className="text-center">
                        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6">
                            Check your email for the reset link.
                        </div>
                        <Link href="/auth/login" className="font-semibold text-[#0B3D2E] hover:underline">
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="name@company.com" className="px-4 py-3" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {CAPTCHA_REQUIRED ? (
                                <TurnstileWidget
                                    siteKey={TURNSTILE_SITE_KEY}
                                    onTokenChange={setCaptchaToken}
                                    resetSignal={captchaResetSignal}
                                    className="flex justify-center"
                                />
                            ) : (
                                <p className="text-center text-sm text-gray-500">Security check skipped in development.</p>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading || (CAPTCHA_REQUIRED && !captchaToken)}
                                className="w-full bg-[#0B3D2E] text-white py-3 rounded-xl font-semibold hover:bg-[#082a20] transition disabled:opacity-50"
                            >
                                {isLoading ? 'Sending link...' : 'Send Reset Link'}
                            </button>
                            <div className="text-center">
                                <Link href="/auth/login" className="font-semibold text-[#0B3D2E] hover:underline">
                                    Back to Sign In
                                </Link>
                            </div>
                        </form>
                    </Form>
                )}
            </div>
        </div>
    )
}
