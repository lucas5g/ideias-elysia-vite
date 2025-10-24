import { createContext } from 'react'

export interface User {
  id: number
  name: string
  email: string
}

export interface AuthContextData {
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  token: string | null
  logout: () => void
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData)
