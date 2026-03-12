import { create } from 'zustand'

export type OnboardingRole = 'investor' | 'startup' | 'advisor'

export type OnboardingStoreState = {
    role: OnboardingRole
    stepIndex: number
    values: Record<string, unknown>
}

export type OnboardingStoreActions = {
    setRole: (role: OnboardingRole) => void
    setStepIndex: (stepIndex: number) => void
    mergeValues: (patch: Record<string, unknown>) => void
    reset: () => void
}

const initialState: OnboardingStoreState = {
    role: 'startup',
    stepIndex: 0,
    values: {},
}

export const useOnboardingStore = create<OnboardingStoreState & OnboardingStoreActions>((set) => ({
    ...initialState,
    setRole: (role) => set({ role }),
    setStepIndex: (stepIndex) => set({ stepIndex: Math.max(0, Math.trunc(stepIndex)) }),
    mergeValues: (patch) =>
        set((state) => ({
            values: {
                ...state.values,
                ...patch,
            },
        })),
    reset: () => set({ ...initialState }),
}))

