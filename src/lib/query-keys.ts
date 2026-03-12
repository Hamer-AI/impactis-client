/**
 * Central query key factory for TanStack Query.
 * Use these keys for useQuery/useMutation and invalidation so the client cache stays consistent.
 */
export const workspaceKeys = {
    all: ['workspace'] as const,
    identity: () => [...workspaceKeys.all, 'identity'] as const,
    bootstrap: () => [...workspaceKeys.all, 'bootstrap'] as const,
    profile: () => [...workspaceKeys.all, 'profile'] as const,
    settings: () => [...workspaceKeys.all, 'settings'] as const,
    billing: () => [...workspaceKeys.all, 'billing'] as const,
    organizations: () => [...workspaceKeys.all, 'organizations'] as const,
}

export const authKeys = {
    all: ['auth'] as const,
    session: () => [...authKeys.all, 'session'] as const,
}
