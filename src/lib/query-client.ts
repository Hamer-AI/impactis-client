import { QueryClient } from '@tanstack/react-query'

const defaultStaleTime = 60 * 1000
const defaultRetry = 1

export function makeQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: defaultStaleTime,
                retry: defaultRetry,
            },
        },
    })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient(): QueryClient {
    if (typeof window === 'undefined') {
        return makeQueryClient()
    }
    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
}
