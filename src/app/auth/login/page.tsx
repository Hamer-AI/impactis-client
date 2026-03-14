'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
import { mapLoginErrorMessage, sanitizeNextPath } from '@/modules/auth'
import TurnstileWidget from '@/components/auth/TurnstileWidget'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { loginSchema, type LoginFormValues } from '@/schemas/auth'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '0x4AAAAAACd7X251ebzrdbGy'
// Always require the Cloudflare Turnstile security check (even in dev).
const CAPTCHA_REQUIRED = true

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const [captchaResetSignal, setCaptchaResetSignal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [nextPath, setNextPath] = useState<string | null>(null)
    const [alreadySignedIn, setAlreadySignedIn] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const query = new URLSearchParams(window.location.search)
        setNextPath(sanitizeNextPath(query.get('next')))
    }, [])

    useEffect(() => {
        let cancelled = false
        authClient.getSession().then(({ data }) => {
            if (!cancelled && data?.user) setAlreadySignedIn(true)
        })
        return () => { cancelled = true }
    }, [])

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    const onSubmit = async (values: LoginFormValues) => {
        if (CAPTCHA_REQUIRED && !captchaToken) {
            toast.error('Please complete the security check.')
            return
        }
        setIsLoading(true)
        try {
            const landingPath = '/'
            const baseNextPath = nextPath ?? landingPath
            const origin = typeof window !== 'undefined' ? window.location.origin : ''
            const callbackURL =
                baseNextPath.startsWith('http://') || baseNextPath.startsWith('https://')
                    ? baseNextPath
                    : origin
                        ? `${origin}${baseNextPath}`
                        : baseNextPath
            const { data: betterAuthData, error: betterAuthError } = await authClient.signIn.email({
                email: values.email.trim(),
                password: values.password,
                callbackURL,
                rememberMe: true,
                fetchOptions: {
                    headers: {
                        ...(captchaToken ? { 'x-captcha-response': captchaToken } : {}),
                    },
                },
            })
            if (betterAuthError || !betterAuthData) {
                toast.error(mapLoginErrorMessage(betterAuthError ?? { message: 'Unable to sign in', code: 'invalid_credentials' } as any))
                setCaptchaResetSignal((c) => c + 1)
                return
            }
            toast.success('Successfully logged in!')
            const queryNextPath = sanitizeNextPath(new URLSearchParams(window.location.search).get('next'))
            const redirectPath = nextPath ?? queryNextPath ?? landingPath
            router.push(redirectPath)
        } catch (err) {
            console.error('Unexpected auth catch:', err)
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
                    <h1 className="mt-4 text-2xl font-semibold text-gray-900">Welcome Back</h1>
                    <p className="mt-2 text-gray-600">Enter your credentials to access your account</p>
                </div>

                {alreadySignedIn && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                        <p className="text-sm font-medium text-emerald-800">You’re already signed in.</p>
                        <p className="mt-1 text-xs text-emerald-700">
                            Continue to your workspace, or sign out to switch accounts.
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                            <Button asChild>
                                <Link href="/workspace">Go to workspace</Link>
                            </Button>
                            <form action="/auth/signout" method="post" className="inline">
                                <Button type="submit" variant="outline">
                                    Sign out
                                </Button>
                            </form>
                        </div>
                    </div>
                )}

                {!alreadySignedIn && (
                    <>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="name@company.com"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[#0B3D2E] focus:border-transparent outline-none transition dark:bg-white dark:text-gray-900 dark:border-gray-300"
                                            {...field}
                                        />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between mb-1">
                                                <FormLabel>Password</FormLabel>
                                                <Link href="/auth/reset-password" className="text-sm font-medium text-[#0B3D2E] hover:underline">
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        className="w-full pr-12 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[#0B3D2E] focus:border-transparent outline-none transition dark:bg-white dark:text-gray-900 dark:border-gray-300"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword((c) => !c)}
                                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
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
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>
                        </Form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Don&apos;t have an account?{' '}
                                <Link
                                    href={(() => {
                                        if (!nextPath) {
                                            return '/auth/signup'
                                        }

                                        return `/auth/signup?next=${encodeURIComponent(nextPath)}`
                                    })()}
                                    className="font-semibold text-[#0B3D2E] hover:underline"
                                >
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
