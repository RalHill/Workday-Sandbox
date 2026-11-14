import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Current user/impersonation state
interface UserState {
  currentUserId: string | null
  currentUserName: string | null
  currentUserRole: string | null
  isImpersonating: boolean
  originalUserId: string | null
}

// UI state
interface UIState {
  isCommandOpen: boolean
  isTasksOpen: boolean
  isSidebarCollapsed: boolean
  activeView: string | null
  pendingTaskCount: number
}

// Sandbox state
interface SandboxState {
  currentSnapshotId: string | null
  hasUnsavedChanges: boolean
  lastSaveTime: Date | null
}

interface AppState extends UserState, UIState, SandboxState {
  // User actions
  setCurrentUser: (id: string, name: string, role: string) => void
  impersonateUser: (id: string, name: string, role: string) => void
  stopImpersonation: () => void
  
  // UI actions
  setCommandOpen: (open: boolean) => void
  toggleCommand: () => void
  setTasksOpen: (open: boolean) => void
  toggleTasks: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setActiveView: (view: string | null) => void
  
  // Sandbox actions
  setCurrentSnapshot: (id: string | null) => void
  markUnsavedChanges: () => void
  markSaved: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial user state
      currentUserId: null,
      currentUserName: null,
      currentUserRole: null,
      isImpersonating: false,
      originalUserId: null,
      
      // Initial UI state
      isCommandOpen: false,
      isTasksOpen: false,
      isSidebarCollapsed: false,
      activeView: null,
      pendingTaskCount: 3, // Default for demo
      
      // Initial sandbox state
      currentSnapshotId: null,
      hasUnsavedChanges: false,
      lastSaveTime: null,
      
      // User actions
      setCurrentUser: (id, name, role) => set({
        currentUserId: id,
        currentUserName: name,
        currentUserRole: role,
        isImpersonating: false,
        originalUserId: null,
      }),
      
      impersonateUser: (id, name, role) => {
        const state = get()
        set({
          currentUserId: id,
          currentUserName: name,
          currentUserRole: role,
          isImpersonating: true,
          originalUserId: state.isImpersonating ? state.originalUserId : state.currentUserId,
        })
      },
      
      stopImpersonation: () => {
        const state = get()
        if (state.isImpersonating && state.originalUserId) {
          // Would need to fetch original user details
          set({
            isImpersonating: false,
            originalUserId: null,
          })
        }
      },
      
      // UI actions
      setCommandOpen: (open) => set({ isCommandOpen: open }),
      toggleCommand: () => set((state) => ({ isCommandOpen: !state.isCommandOpen })),
      setTasksOpen: (open) => set({ isTasksOpen: open }),
      toggleTasks: () => set((state) => ({ isTasksOpen: !state.isTasksOpen })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setActiveView: (view) => set({ activeView: view }),
      
      // Sandbox actions
      setCurrentSnapshot: (id) => set({ currentSnapshotId: id }),
      markUnsavedChanges: () => set({ hasUnsavedChanges: true }),
      markSaved: () => set({ 
        hasUnsavedChanges: false, 
        lastSaveTime: new Date() 
      }),
    }),
    {
      name: 'workday-sandbox-store',
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        currentUserName: state.currentUserName,
        currentUserRole: state.currentUserRole,
        isSidebarCollapsed: state.isSidebarCollapsed,
        currentSnapshotId: state.currentSnapshotId,
      }),
    }
  )
)

// Keyboard shortcut hook
export function useKeyboardShortcuts() {
  const { toggleCommand, toggleTasks } = useAppStore()
  
  if (typeof window !== 'undefined') {
    // This would be set up in a useEffect in a client component
  }
  
  return { toggleCommand, toggleTasks }
}
