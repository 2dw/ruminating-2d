"use client"
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  login: (token: string) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  login: () => {},
  logout: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("ecoflow_admin_token")
    if (stored) setToken(stored)
    setLoading(false)
  }, [])

  const login = useCallback((newToken: string) => {
    localStorage.setItem("ecoflow_admin_token", newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("ecoflow_admin_token")
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated: token !== null && token.length > 0, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
