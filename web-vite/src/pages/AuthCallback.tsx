import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const handleCallback = () => {
      // Pegar token e redirect da URL
      const token = searchParams.get('token')
      const redirectTo = searchParams.get('redirect') || '/'
      const error = searchParams.get('error')

      // Se houver erro, mostrar mensagem e redirecionar
      if (error) {
        console.error('Erro no login:', error)
        alert(`Erro ao fazer login: ${error}`)
        navigate('/')
        return
      }

      // Se não tem token, algo deu errado
      if (!token) {
        console.error('Token não encontrado na URL de callback')
        navigate('/')
        return
      }

      try {
        // Salvar apenas o token no localStorage
        localStorage.setItem('ideias-token', token)

        console.log('Login realizado com sucesso')

        // Redirecionar para a página que o usuário queria acessar
        // Força reload para o AuthContext pegar os novos dados
        window.location.href = redirectTo
      } catch (err) {
        console.error('Erro ao processar callback:', err)
        logout()
        navigate('/')
      }
    }

    handleCallback()
  }, [searchParams, navigate, logout])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-6"></div>
        <h2 className="text-white text-2xl font-semibold mb-2">Finalizando login...</h2>
        <p className="text-gray-400">Aguarde enquanto configuramos sua conta</p>
      </div>
    </div>
  )
}
