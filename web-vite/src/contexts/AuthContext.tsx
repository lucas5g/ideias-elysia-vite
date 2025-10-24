import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getInfoUser } from '@/utils/get-info-user'
import { AuthContext, type User } from './auth-context'

const TOKEN_KEY = 'ideias-token'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Inicialização: verificar se há token salvo
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY)
        const userInfo = getInfoUser()

        if (storedToken && userInfo) {
          setToken(storedToken)
          setUser(userInfo)
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error('Erro ao carregar autenticação:', err)
        // Limpar dados corrompidos
        localStorage.removeItem(TOKEN_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredAuth()
  }, [])

  const logout = () => {
    // Limpar localStorage
    localStorage.removeItem(TOKEN_KEY)

    // Limpar estado
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)

    console.log('Logout realizado')
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        user,
        token,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
