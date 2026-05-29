import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      access: null,
      refresh: null,

      setAuth: (user, access, refresh) => {
        localStorage.setItem('access', access)
        localStorage.setItem('refresh', refresh)
        set({ user, access, refresh })
      },

      clearAuth: () => {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        set({ user: null, access: null, refresh: null })
      },

      setUser: (user) => set({ user }),
    }),
    { name: 'auth' }
  )
)

export default useAuthStore
