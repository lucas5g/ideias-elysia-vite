import { useEffect, useState } from 'react'
import { api } from '@/utils/api'
import { Loading } from '@/components/Loading'
import { useAuth } from '@/hooks/useAuth'

interface UserData {
  id: number
  name: string
  email: string
  weight: number | null
  weightGoal: number | null
  calorie: number | null
  createdAt?: string
  updatedAt?: string
}

export function Me() {
  // Handler para submit via Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };
  const { logout } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    weightGoal: '',
    calorie: ''
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/auth/me')
        setUserData(response.data)
        setFormData({
          name: response.data.name,
          weight: response.data.weight !== null ? String(response.data.weight) : '',
          weightGoal: response.data.weightGoal !== null ? String(response.data.weightGoal) : '',
          calorie: response.data.calorie !== null ? String(response.data.calorie) : ''
        })
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err)
        const error = err as { response?: { data?: { message?: string } } }
        setError(error.response?.data?.message || 'Erro ao carregar dados do usuário')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      // Preparar dados para envio, convertendo strings vazias para null
      const dataToSend = {
        name: formData.name,
        weight: formData.weight !== '' ? Number(formData.weight) : null,
        weightGoal: formData.weightGoal !== '' ? Number(formData.weightGoal) : null,
        calorie: formData.calorie !== '' ? Number(formData.calorie) : null
      }

      const response = await api.patch('/auth/me', dataToSend)
      setUserData(response.data)
      setFormData({
        name: response.data.name,
        weight: response.data.weight !== null ? String(response.data.weight) : '',
        weightGoal: response.data.weightGoal !== null ? String(response.data.weightGoal) : '',
        calorie: response.data.calorie !== null ? String(response.data.calorie) : ''
      })
    } catch (err) {
      console.error('Erro ao atualizar dados:', err)
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Erro ao atualizar dados do usuário')
    } finally {
      setIsSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="bg-gray-800 min-h-screen text-white flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="bg-r04867ed-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-2">Erro</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 min-h-screen text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">ID</label>
              <p className="text-white text-lg">{userData?.id}</p>
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyDown={handleKeyDown}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-lg w-full focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <p className="text-white text-lg">{userData?.email}</p>
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">Peso (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                onKeyDown={handleKeyDown}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-lg w-full focus:outline-none focus:border-blue-500"
                min="0"
                step="0.1"
                placeholder="Digite seu peso"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">Meta de Peso (kg)</label>
              <input
                type="number"
                value={formData.weightGoal}
                onChange={(e) => setFormData({ ...formData, weightGoal: e.target.value })}
                onKeyDown={handleKeyDown}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-lg w-full focus:outline-none focus:border-blue-500"
                min="0"
                step="0.1"
                placeholder="Digite sua meta de peso"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">Calorias</label>
              <input
                type="number"
                value={formData.calorie}
                onChange={(e) => setFormData({ ...formData, calorie: e.target.value })}
                onKeyDown={handleKeyDown}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-lg w-full focus:outline-none focus:border-blue-500"
                min="0"
                step="1"
                placeholder="Digite suas calorias"
              />
            </div>

            {userData?.createdAt && (
              <div>
                <label className="text-gray-400 text-sm">Criado em</label>
                <p className="text-white text-lg">
                  {new Date(userData.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}

            {userData?.updatedAt && (
              <div>
                <label className="text-gray-400 text-sm">Atualizado em</label>
                <p className="text-white text-lg">
                  {new Date(userData.updatedAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700 flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>           
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer ml-auto"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
