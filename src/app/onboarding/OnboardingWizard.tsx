'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { ZodSchema } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useOnboardingSave } from '@/modules/onboarding/useOnboardingSave'
import { useOnboardingStore, type OnboardingRole } from '@/modules/onboarding/store'
import { getDashboardPathForRole } from '@/modules/auth'

export type StepConfig<TValues extends Record<string, unknown>> = {
    id: string
    label: string
    schema: ZodSchema<TValues>
    fields: (keyof TValues)[]
    render: (form: ReturnType<typeof useForm<TValues>>) => React.ReactNode
}

function Stepper(input: {
    steps: Array<{ label: string }>
    currentIndex: number
    onClickCompleted: (idx: number) => void
}) {
    return (
        <ol className="flex items-center gap-3">
            {input.steps.map((s, idx) => {
                const done = idx < input.currentIndex
                const active = idx === input.currentIndex
                return (
                    <li key={`${s.label}-${idx}`} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => (done ? input.onClickCompleted(idx) : null)}
                            className={cn(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-black transition',
                                done
                                    ? 'border-emerald-600 bg-emerald-600 text-white hover:opacity-90'
                                    : active
                                        ? 'border-[#0B3D2E] bg-white text-[#0B3D2E] dark:bg-slate-950 dark:text-emerald-200 dark:border-emerald-500/60'
                                        : 'border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400',
                                done ? 'cursor-pointer' : 'cursor-default',
                            )}
                            aria-current={active ? 'step' : undefined}
                        >
                            {idx + 1}
                        </button>
                        <span className={cn('hidden text-base font-bold sm:block', active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400')}>
                            {s.label}
                        </span>
                        {idx < input.steps.length - 1 ? (
                            <div className={cn('h-0.5 w-12 rounded-full', done ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800')} />
                        ) : null}
                    </li>
                )
            })}
        </ol>
    )
}

export function OnboardingWizard<TValues extends Record<string, unknown>>(props: {
    role: OnboardingRole
    steps: Array<StepConfig<TValues>>
    initialStep: number
    initialValues: Partial<TValues>
}) {
    const router = useRouter()
    const save = useOnboardingSave()
    const store = useOnboardingStore()

    const [currentIndex, setCurrentIndex] = useState(Math.max(0, Math.min(props.steps.length - 1, props.initialStep)))
    const step = props.steps[currentIndex]

    const hasInitialValues = props.initialValues && Object.keys(props.initialValues as Record<string, unknown>).length > 0

    useEffect(() => {
        store.setRole(props.role)
        store.setStepIndex(currentIndex)
        if (hasInitialValues) {
            store.mergeValues(props.initialValues as Record<string, unknown>)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const schema = step.schema

    const form = useForm<TValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            ...(store.values as any),
            ...(props.initialValues as any),
        } as any,
        mode: 'onBlur',
        shouldUnregister: false,
    })

    useEffect(() => {
        if (hasInitialValues && (props.initialValues as Record<string, unknown>)) {
            form.reset(props.initialValues as any)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasInitialValues])

    useEffect(() => {
        const subscription = form.watch((value) => {
            store.mergeValues((value ?? {}) as Record<string, unknown>)
        })
        return () => subscription.unsubscribe()
    }, [form, store])

    const stepCount = props.steps.length
    const canBack = currentIndex > 0
    const canSkip = currentIndex >= 1

    const goDashboard = () => {
        const dest = getDashboardPathForRole(props.role)
        // Hard navigation is more reliable here than client routing because
        // onboarding completion is stored server-side and we want a fresh render.
        if (typeof window !== 'undefined') {
            window.location.assign(dest)
            return
        }
        router.push(dest)
    }

    const persist = async (input: { completed?: boolean; skipped?: boolean }) => {
        const values = {
            ...(store.values as Record<string, unknown>),
            ...(form.getValues() as Record<string, unknown>),
        }
        store.mergeValues(values as any)
        try {
            await save({
                role: props.role,
                stepIndex: currentIndex,
                totalSteps: stepCount,
                values: values as any,
                completed: input.completed,
                skipped: input.skipped,
            })
        } catch (error) {
            // Best-effort persistence; don't block navigation if the network fails.
            // eslint-disable-next-line no-console
            console.warn('Onboarding persist failed', error)
        }
    }

    const onNext = async () => {
        // strict validate step fields
        const ok = await form.trigger(step.fields as any)
        if (!ok) return

        await persist({})

        if (currentIndex >= stepCount - 1) {
            await persist({ completed: true })
            goDashboard()
            return
        }
        const next = currentIndex + 1
        setCurrentIndex(next)
        store.setStepIndex(next)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const onBack = () => {
        if (!canBack) return
        const next = Math.max(0, currentIndex - 1)
        setCurrentIndex(next)
        store.setStepIndex(next)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const onSkip = async () => {
        await persist({ completed: true, skipped: true })
        goDashboard()
    }

    const onClickCompleted = (idx: number) => {
        if (idx < 0 || idx >= currentIndex) return
        setCurrentIndex(idx)
        store.setStepIndex(idx)
    }

    return (
        <div className="w-full max-w-4xl">
            <Card className="shadow-xl overflow-hidden">
                <CardHeader className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="text-3xl font-black tracking-tight">Onboarding</CardTitle>
                            <CardDescription className="mt-1.5 text-base font-semibold">
                                Step {currentIndex + 1} of {stepCount}
                            </CardDescription>
                        </div>
                        <div className="pt-1 max-w-full overflow-x-auto">
                            <div className="min-w-max">
                                <Stepper
                                    steps={props.steps.map((s) => ({ label: s.label }))}
                                    currentIndex={currentIndex}
                                    onClickCompleted={onClickCompleted}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-6 pb-8 pt-2 sm:px-8 sm:pb-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={{ duration: 0.18 }}
                        >
                            {step.render(form)}
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                {canBack ? (
                                    <Button type="button" variant="secondary" onClick={onBack} className="min-h-11 px-5 text-base font-semibold">
                                        Back
                                    </Button>
                                ) : null}
                            </div>
                            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-5">
                                <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                    Step {currentIndex + 1} of {stepCount}
                                </div>
                                <div className="flex items-center gap-4">
                                    {canSkip ? (
                                        <button
                                            type="button"
                                            onClick={onSkip}
                                            className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                        >
                                            Skip for now
                                        </button>
                                    ) : null}
                                    <Button type="button" onClick={onNext} className="min-h-11 px-6 text-base font-semibold">
                                        {currentIndex === stepCount - 1 ? 'Finish' : 'Next'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

