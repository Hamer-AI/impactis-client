'use client'

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'

export type WorkspaceTheme = 'light' | 'dark'

const WORKSPACE_LIGHT_CLASS = 'workspace-theme-light'
const THEME_STORAGE_KEY = 'workspace-theme'

function applyWorkspaceTheme(theme: WorkspaceTheme) {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle(WORKSPACE_LIGHT_CLASS, theme === 'light')
}

function persistWorkspaceTheme(theme: WorkspaceTheme) {
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme)
        } catch {
            // ignore
        }
    }
    if (typeof document !== 'undefined') {
        document.cookie = `workspace_theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`
    }
}

function getStoredTheme(): WorkspaceTheme {
    if (typeof window !== 'undefined') {
        try {
            const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
            if (stored === 'light' || stored === 'dark') return stored
        } catch {
            // ignore
        }
        const cookieMatch = document.cookie.match(/(?:^|;\s*)workspace_theme=([^;]+)/)
        if (cookieMatch) {
            const v = decodeURIComponent(cookieMatch[1] ?? '')
            if (v === 'light' || v === 'dark') return v
        }
        if (document.documentElement.classList.contains(WORKSPACE_LIGHT_CLASS)) return 'light'
    }
    return 'dark'
}

export type WorkspaceThemeContextValue = {
    theme: WorkspaceTheme
    isLight: boolean
    setTheme: (theme: WorkspaceTheme) => void
}

const WorkspaceThemeContext = createContext<WorkspaceThemeContextValue | null>(null)

export function useWorkspaceTheme(fallbackIsLight?: boolean): WorkspaceThemeContextValue {
    const ctx = useContext(WorkspaceThemeContext)
    if (ctx) return ctx
    const isLight = fallbackIsLight ?? false
    return useMemo(
        () => ({
            theme: isLight ? 'light' : 'dark',
            isLight,
            setTheme: () => {},
        }),
        [isLight]
    )
}

type WorkspaceThemeProviderProps = {
    initialIsLight: boolean
    children: ReactNode
}

export function WorkspaceThemeProvider({ initialIsLight, children }: WorkspaceThemeProviderProps) {
    const [theme, setThemeState] = useState<WorkspaceTheme>(() =>
        initialIsLight ? 'light' : 'dark'
    )

    useEffect(() => {
        const stored = getStoredTheme()
        setThemeState(stored)
        applyWorkspaceTheme(stored)
    }, [])

    useEffect(() => {
        applyWorkspaceTheme(theme)
    }, [theme])

    const setTheme = useCallback((next: WorkspaceTheme) => {
        setThemeState(next)
        applyWorkspaceTheme(next)
        persistWorkspaceTheme(next)
    }, [])

    const value = useMemo<WorkspaceThemeContextValue>(
        () => ({
            theme,
            isLight: theme === 'light',
            setTheme,
        }),
        [theme, setTheme]
    )

    return (
        <WorkspaceThemeContext.Provider value={value}>
            {children}
        </WorkspaceThemeContext.Provider>
    )
}
