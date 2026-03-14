'use client'

import { z } from 'zod'
import type { StepConfig } from '../OnboardingWizard'
import {
    investorOnboardingSchema,
    INVESTING_YEARS_OPTIONS,
    TOTAL_INVESTMENTS_OPTIONS,
    CHECK_SIZE_OPTIONS,
    INVESTABLE_CAPITAL_OPTIONS,
    INVESTMENTS_PLANNED_OPTIONS,
    PREFERRED_STRUCTURE_OPTIONS,
    MATURITY_INDICATORS,
    SECTORS,
    REGIONS,
    REMOTE_TEAM_OPTIONS,
    INVESTMENT_STYLE_OPTIONS,
    VALUE_ADD_OPTIONS,
    DIVERSITY_FOCUS_OPTIONS,
    type InvestorOnboardingValues,
} from '@/modules/onboarding/investor'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

function CheckboxGroup(input: {
    value: string[]
    onChange: (next: string[]) => void
    options: readonly string[]
}) {
    const set = new Set(input.value)
    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {input.options.map((opt) => {
                const checked = set.has(opt)
                return (
                    <label key={opt} className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                                const next = new Set(set)
                                if (e.target.checked) next.add(opt)
                                else next.delete(opt)
                                input.onChange(Array.from(next))
                            }}
                        />
                        {opt}
                    </label>
                )
            })}
        </div>
    )
}

const inputClass = 'min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none focus:border-[#0B3D2E] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
const labelClass = 'text-base font-bold'

function SelectField(input: {
    label: string
    name: keyof InvestorOnboardingValues
    options: readonly string[]
    form: any
    required?: boolean
}) {
    return (
        <FormField
            control={input.form.control}
            name={input.name as any}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className={labelClass}>{input.label}</FormLabel>
                    <FormControl>
                        <select
                            className={inputClass}
                            value={(field.value as any) ?? ''}
                            onChange={(e) => field.onChange(e.target.value)}
                        >
                            <option value="" disabled>
                                Select...
                            </option>
                            {input.options.map((o) => (
                                <option key={o} value={o}>
                                    {o}
                                </option>
                            ))}
                        </select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

const step1Schema = investorOnboardingSchema.pick({
    investingYears: true,
    totalStartupInvestments: true,
    notableExits: true,
})

const step2Schema = investorOnboardingSchema.pick({
    typicalCheckSize: true,
    investableCapital12mo: true,
    investmentsPlanned: true,
    preferredStructure: true,
})

const step3Schema = investorOnboardingSchema.pick({
    stagePreference: true,
    maturityIndicators: true,
})

const step4Schema = investorOnboardingSchema.pick({
    primaryIndustries: true,
    industryMatrix: true,
})

const step5Schema = investorOnboardingSchema.pick({
    targetRegions: true,
    remoteTeamPreference: true,
})

const step6Schema = investorOnboardingSchema.pick({
    investmentStyle: true,
    valueAddBeyondCapital: true,
    founderDiversityFocus: true,
})

export function getInvestorSteps(): Array<StepConfig<InvestorOnboardingValues>> {
    return [
        {
            id: 'investor-step-1',
            label: 'Experience',
            schema: step1Schema as unknown as z.ZodSchema<InvestorOnboardingValues>,
            fields: ['investingYears', 'totalStartupInvestments', 'notableExits'],
            render: (form) => (
                <Form {...form}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <SelectField
                            form={form}
                            name="investingYears"
                            label="How long have you been investing?"
                            options={INVESTING_YEARS_OPTIONS}
                            required
                        />
                        <SelectField
                            form={form}
                            name="totalStartupInvestments"
                            label="Total startup investments made"
                            options={TOTAL_INVESTMENTS_OPTIONS}
                            required
                        />
                        <FormField
                            control={form.control}
                            name="notableExits"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Notable exits (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g. Company X – 10x" {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            ),
        },
        {
            id: 'investor-step-2',
            label: 'Capacity',
            schema: step2Schema as unknown as z.ZodSchema<InvestorOnboardingValues>,
            fields: ['typicalCheckSize', 'investableCapital12mo', 'investmentsPlanned', 'preferredStructure'],
            render: (form) => (
                <Form {...form}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <SelectField form={form} name="typicalCheckSize" label="Typical Check Size" options={CHECK_SIZE_OPTIONS} />
                        <SelectField form={form} name="investableCapital12mo" label="Total Investable Capital (next 12 months)" options={INVESTABLE_CAPITAL_OPTIONS} />
                        <SelectField form={form} name="investmentsPlanned" label="Number of Investments Planned" options={INVESTMENTS_PLANNED_OPTIONS} />
                        <FormField
                            control={form.control}
                            name="preferredStructure"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Preferred Structure</FormLabel>
                                    <FormControl>
                                        <CheckboxGroup
                                            value={Array.isArray(field.value) ? (field.value as any) : []}
                                            onChange={field.onChange}
                                            options={PREFERRED_STRUCTURE_OPTIONS}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            ),
        },
        {
            id: 'investor-step-3',
            label: 'Stages',
            schema: step3Schema as unknown as z.ZodSchema<InvestorOnboardingValues>,
            fields: ['stagePreference', 'maturityIndicators'],
            render: (form) => (
                <Form {...form}>
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                            <p className="text-sm font-black text-slate-900 dark:text-slate-100">Stage preference</p>
                            <div className="mt-3 grid gap-3 text-sm">
                                {[
                                    { label: 'Pre-seed (Idea)', iKey: 'preSeedInterest', pKey: 'preSeedPercent' },
                                    { label: 'Seed', iKey: 'seedInterest', pKey: 'seedPercent' },
                                    { label: 'Series A', iKey: 'seriesAInterest', pKey: 'seriesAPercent' },
                                ].map((row) => (
                                    <div key={row.label} className="grid gap-3 sm:grid-cols-[1fr_180px_180px] sm:items-center">
                                        <div className="font-semibold text-slate-700 dark:text-slate-200">{row.label}</div>
                                        <FormField
                                            control={form.control}
                                            name={`stagePreference.${row.iKey}` as any}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <select
                                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-[#0B3D2E] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                                            value={(field.value as any) ?? ''}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                        >
                                                            <option value="">Interest (1–5)</option>
                                                            {[1, 2, 3, 4, 5].map((v) => (
                                                                <option key={v} value={v}>
                                                                    {v}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`stagePreference.${row.pKey}` as any}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Portfolio %"
                                                            inputMode="numeric"
                                                            {...field}
                                                            value={(field.value as any) ?? ''}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="maturityIndicators"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maturity Indicators</FormLabel>
                                    <FormControl>
                                        <CheckboxGroup
                                            value={Array.isArray(field.value) ? (field.value as any) : []}
                                            onChange={field.onChange}
                                            options={MATURITY_INDICATORS}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            ),
        },
        {
            id: 'investor-step-4',
            label: 'Industries',
            schema: step4Schema as unknown as z.ZodSchema<InvestorOnboardingValues>,
            fields: ['primaryIndustries', 'industryMatrix'],
            render: (form) => (
                <Form {...form}>
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="primaryIndustries"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Primary Industries (max 5)</FormLabel>
                                    <FormControl>
                                        <CheckboxGroup
                                            value={Array.isArray(field.value) ? (field.value as any) : []}
                                            onChange={field.onChange}
                                            options={SECTORS}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                            <p className="text-sm font-black text-slate-900 dark:text-slate-100">Industry matrix</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Mark each sector as Must Have, Open To, or Not Interested.
                            </p>
                            <div className="mt-4 grid gap-3">
                                {SECTORS.map((sector) => (
                                    <FormField
                                        key={sector}
                                        control={form.control}
                                        name={`industryMatrix.${sector}` as any}
                                        render={({ field }) => (
                                            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{sector}</div>
                                                <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                    {[
                                                        { v: 'must', l: 'Must Have' },
                                                        { v: 'open', l: 'Open To' },
                                                        { v: 'no', l: 'Not Interested' },
                                                    ].map((opt) => (
                                                        <label key={opt.v} className="flex items-center gap-1.5">
                                                            <input
                                                                type="radio"
                                                                name={field.name}
                                                                value={opt.v}
                                                                checked={field.value === opt.v}
                                                                onChange={() => field.onChange(opt.v)}
                                                            />
                                                            {opt.l}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </Form>
            ),
        },
        {
            id: 'investor-step-5',
            label: 'Geography',
            schema: step5Schema as unknown as z.ZodSchema<InvestorOnboardingValues>,
            fields: ['targetRegions', 'remoteTeamPreference'],
            render: (form) => (
                <Form {...form}>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="targetRegions"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Target Regions</FormLabel>
                                    <FormControl>
                                        <CheckboxGroup
                                            value={Array.isArray(field.value) ? (field.value as any) : []}
                                            onChange={field.onChange}
                                            options={REGIONS}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <SelectField form={form} name="remoteTeamPreference" label="Remote Team Preference" options={REMOTE_TEAM_OPTIONS} />
                    </div>
                </Form>
            ),
        },
        {
            id: 'investor-step-6',
            label: 'Value add',
            schema: step6Schema as unknown as z.ZodSchema<InvestorOnboardingValues>,
            fields: ['investmentStyle', 'valueAddBeyondCapital', 'founderDiversityFocus'],
            render: (form) => (
                <Form {...form}>
                    <div className="space-y-6">
                        <SelectField form={form} name="investmentStyle" label="Investment Style" options={INVESTMENT_STYLE_OPTIONS} />
                        <FormField
                            control={form.control}
                            name="valueAddBeyondCapital"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Value Add Beyond Capital</FormLabel>
                                    <FormControl>
                                        <CheckboxGroup
                                            value={Array.isArray(field.value) ? (field.value as any) : []}
                                            onChange={field.onChange}
                                            options={VALUE_ADD_OPTIONS}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <SelectField form={form} name="founderDiversityFocus" label="Founder Diversity Focus" options={DIVERSITY_FOCUS_OPTIONS} />
                    </div>
                </Form>
            ),
        },
    ]
}

