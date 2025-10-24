import { useLocation } from 'react-router'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  // Enquanto está carregando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não está autenticado, redirecionar para Google OAuth
  if (!isAuthenticated) {
    const baseUrl = import.meta.env.VITE_BASE_URL_API
    const currentPage = location.pathname + location.search
    const googleAuthUrl = `${baseUrl}/auth/google?redirect=${encodeURIComponent(currentPage)}`

    // Usar window.location.href para sair completamente do React
    window.location.href = googleAuthUrl

    // Retornar loading enquanto redireciona
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecionando para login com Google...</p>
        </div>
      </div>
    )
  }

  // Se está autenticado, renderizar o conteúdo
  return <>{children}</>
}
