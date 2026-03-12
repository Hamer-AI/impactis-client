'use client'

import { useQuery } from '@tanstack/react-query'
import { workspaceKeys } from '@/lib/query-keys'
import { getWorkspaceIdentityAction } from '@/app/workspace/actions'
import type { WorkspaceIdentitySnapshot } from '@/modules/workspace'

type Props = {
    initialData: WorkspaceIdentitySnapshot
    children: React.ReactNode
}

/**
 * Hydrates the workspace identity query cache with server-fetched initial data.
 * Place in a page that already fetched identity in a Server Component; refetches and mutations will use the same key.
 */
export function WorkspaceIdentityHydration({ initialData, children }: Props) {
    useQuery({
        queryKey: workspaceKeys.identity(),
        queryFn: getWorkspaceIdentityAction,
        initialData,
        staleTime: 60 * 1000,
    })
    return <>{children}</>
}
