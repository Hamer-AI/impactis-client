import { create } from 'zustand'

type WorkspaceUIState = {
    sidebarCollapsed: boolean
    setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void
    toggleSidebar: () => void
}

export const useWorkspaceUI = create<WorkspaceUIState>((set) => ({
    sidebarCollapsed: false,
    setSidebarCollapsed: (collapsed) =>
        set((state) => ({
            sidebarCollapsed: typeof collapsed === 'function' ? collapsed(state.sidebarCollapsed) : collapsed,
        })),
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
