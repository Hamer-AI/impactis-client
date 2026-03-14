'use client'

import { z } from 'zod'
import type { StepConfig } from '../OnboardingWizard'
import {
    advisorOnboardingSchema,
    BUSINESS_TYPE_OPTIONS,
    YEARS_CONSULTING_OPTIONS,
    PREVIOUS_EXPERIENCE_OPTIONS,
    COMPETENCY_OPTIONS,
    CLIENT_TYPES_SERVED,
    PREFERRED_STAGES,
    SECTORS,
    REGIONS,
    ENGAGEMENT_LENGTH_OPTIONS,
    type AdvisorOnboardingValues,
} from '@/modules/onboarding/advisor'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

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
    name: keyof AdvisorOnboardingValues
    options: readonly string[]
    form: any
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

const base = (advisorOnboardingSchema as any)._def?.schema ?? advisorOnboardingSchema

const step1Schema = base.pick({
    businessType: true,
    yearsConsulting: true,
    previousExperience: true,
})
const step2Schema = base.pick({
    competencyRank1: true,
    competencyRank2: true,
    competencyRank3: true,
})
const step3Schema = base.pick({
    strategicConsulting: true,
    strategicHourlyRateUsd: true,
    strategicProjectRangeMinUsd: true,
    strategicProjectRangeMaxUsd: true,
    fractionalExecutive: true,
    fractionalMonthlyRetainerUsd: true,
    fractionalHoursPerWeek: true,
    advisoryBoardSeat: true,
    boardEquityPercent: true,
    boardCashRetainerUsd: true,
    workshopTraining: true,
    workshopDayRateUsd: true,
    otherModel: true,
    otherModelDescription: true,
})
const step4Schema = base.pick({
    clientTypesServed: true,
    notableClients: true,
    revenueGrowthUsd: true,
    fundingRaisedUsd: true,
    clientsServedCount: true,
})
const step5Schema = base.pick({
    stageMatch: true,
    preferredIndustries: true,
    preferredGeography: true,
    engagementLengthPreference: true,
})

export function getAdvisorSteps(): Array<StepConfig<AdvisorOnboardingValues>> {
    return [
        {
            id: 'advisor-step-1',
            label: 'Identity',
            schema: step1Schema as unknown as z.ZodSchema<AdvisorOnboardingValues>,
            fields: ['businessType', 'yearsConsulting', 'previousExperience'],
            render: (form) => (
                <Form {...form}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <SelectField form={form} name="businessType" label="Business Type" options={BUSINESS_TYPE_OPTIONS} />
                        <SelectField form={form} name="yearsConsulting" label="Years in Consulting" options={YEARS_CONSULTING_OPTIONS} />
                        <FormField
                            control={form.control}
                            name="previousExperience"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Previous Experience</FormLabel>
                                    <FormControl>
                                        <CheckboxGroup
                                            value={Array.isArray(field.value) ? (field.value as any) : []}
                                            onChange={field.onChange}
                                            options={PREVIOUS_EXPERIENCE_OPTIONS}
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
            id: 'advisor-step-2',
            label: 'Competencies',
            schema: step2Schema as unknown as z.ZodSchema<AdvisorOnboardingValues>,
            fields: ['competencyRank1', 'competencyRank2', 'competencyRank3'],
            render: (form) => (
                <Form {...form}>
                    <div className="grid gap-5 sm:grid-cols-3">
                        <SelectField form={form} name="competencyRank1" label="Rank 1" options={COMPETENCY_OPTIONS} />
                        <SelectField form={form} name="competencyRank2" label="Rank 2" options={COMPETENCY_OPTIONS} />
                        <SelectField form={form} name="competencyRank3" label="Rank 3" options={COMPETENCY_OPTIONS} />
                    </div>
                </Form>
            ),
        },
        {
            id: 'advisor-step-3',
            label: 'Services',
            schema: step3Schema as unknown as z.ZodSchema<AdvisorOnboardingValues>,
            fields: ['strategicConsulting', 'fractionalExecutive', 'advisoryBoardSeat', 'workshopTraining', 'otherModel'],
            render: (form) => (
                <Form {...form}>
                    <div className="space-y-6">
                        {[
                            { k: 'strategicConsulting', label: 'Strategic Consulting' },
                            { k: 'fractionalExecutive', label: 'Fractional Executive' },
                            { k: 'advisoryBoardSeat', label: 'Advisory / Board Seat' },
                            { k: 'workshopTraining', label: 'Workshop / Training' },
                            { k: 'otherModel', label: 'Other' },
                        ].map((row) => (
                            <FormField
                                key={row.k}
                                control={form.control}
                                name={row.k as any}
                                render={({ field }) => (
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <input type="checkbox" checked={field.value === true} onChange={(e) => field.onChange(e.target.checked)} />
                                        {row.label}
                                    </label>
                                )}
                            />
                        ))}

                        <div className="grid gap-5 sm:grid-cols-2">
                            <FormField control={form.control} name="strategicHourlyRateUsd" render={({ field }) => (
                                <FormItem><FormLabel>Hourly Rate ($)</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="fractionalMonthlyRetainerUsd" render={({ field }) => (
                                <FormItem><FormLabel>Monthly Retainer ($)</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="boardEquityPercent" render={({ field }) => (
                                <FormItem><FormLabel>Equity Expectation (%)</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="workshopDayRateUsd" render={({ field }) => (
                                <FormItem><FormLabel>Day Rate ($)</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                            )} />
                        </div>

                        <FormField
                            control={form.control}
                            name="otherModelDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Other model description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} value={(field.value as any) ?? ''} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            ),
        },
        {
            id: 'advisor-step-4',
            label: 'Track record',
            schema: step4Schema as unknown as z.ZodSchema<AdvisorOnboardingValues>,
            fields: ['clientTypesServed', 'revenueGrowthUsd', 'fundingRaisedUsd', 'clientsServedCount'],
            render: (form) => (
                <Form {...form}>
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="clientTypesServed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Types Served</FormLabel>
                                    <FormControl>
                                        <CheckboxGroup
                                            value={Array.isArray(field.value) ? (field.value as any) : []}
                                            onChange={field.onChange}
                                            options={CLIENT_TYPES_SERVED}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="grid gap-5 sm:grid-cols-3">
                            <FormField control={form.control} name="revenueGrowthUsd" render={({ field }) => (
                                <FormItem><FormLabel>$ Revenue Growth</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="fundingRaisedUsd" render={({ field }) => (
                                <FormItem><FormLabel>$ Funding Raised</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="clientsServedCount" render={({ field }) => (
                                <FormItem><FormLabel># Clients Served</FormLabel><FormControl><Input inputMode="numeric" {...field} value={(field.value as any) ?? ''} /></FormControl></FormItem>
                            )} />
                        </div>
                    </div>
                </Form>
            ),
        },
        {
            id: 'advisor-step-5',
            label: 'Ideal fit',
            schema: step5Schema as unknown as z.ZodSchema<AdvisorOnboardingValues>,
            fields: ['preferredIndustries', 'preferredGeography', 'engagementLengthPreference'],
            render: (form) => (
                <Form {...form}>
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                            <p className="text-sm font-black text-slate-900 dark:text-slate-100">Startup Stage Match</p>
                            <div className="mt-4 grid gap-3">
                                {PREFERRED_STAGES.map((stage) => (
                                    <FormField
                                        key={stage}
                                        control={form.control}
                                        name={`stageMatch.${stage}.workWith` as any}
                                        render={({ field }) => (
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                    <input type="checkbox" checked={field.value === true} onChange={(e) => field.onChange(e.target.checked)} />
                                                    {stage}
                                                </label>
                                                <div className="flex gap-3">
                                                    <FormField
                                                        control={form.control}
                                                        name={`stageMatch.${stage}.preference` as any}
                                                        render={({ field: pref }) => (
                                                            <select
                                                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-[#0B3D2E] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                                                value={(pref.value as any) ?? ''}
                                                                onChange={(e) => pref.onChange(e.target.value)}
                                                            >
                                                                <option value="">Preference</option>
                                                                {['Preferred', 'OK', 'Last resort'].map((v) => (
                                                                    <option key={v} value={v}>
                                                                        {v}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`stageMatch.${stage}.minProjectSizeUsd` as any}
                                                        render={({ field: min }) => (
                                                            <Input
                                                                className="w-40"
                                                                inputMode="numeric"
                                                                placeholder="Min $"
                                                                {...min}
                                                                value={(min.value as any) ?? ''}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="preferredIndustries"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preferred Industries (max 5)</FormLabel>
                                    <FormControl>
                                        <CheckboxGroup
                                            value={Array.isArray(field.value) ? (field.value as any) : []}
                                            onChange={field.onChange}
                                            options={SECTORS}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="preferredGeography"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preferred Geography</FormLabel>
                                    <FormControl>
                                        <CheckboxGroup
                                            value={Array.isArray(field.value) ? (field.value as any) : []}
                                            onChange={field.onChange}
                                            options={REGIONS}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <SelectField form={form} name="engagementLengthPreference" label="Engagement Length Preference" options={ENGAGEMENT_LENGTH_OPTIONS} />
                    </div>
                </Form>
            ),
        },
    ]
}

