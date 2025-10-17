import { useState, useEffect } from 'react'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { api } from '@/utils/api'
import { fetcher } from '@/utils/fetcher'
import { Trash, Plus, CaretUp } from '@phosphor-icons/react'

interface Food {
  id: number
  name: string
  protein: number
  fat: number
  carbo: number
  fiber: number
  calorie: number
}

interface DietItem {
  id?: number
  meal: string
  foodId: number
  food: string
  quantity: number
  protein: number
  fat: number
  carbo: number
  fiber: number
  calorie: number
}

interface MealItem {
  id: string
  meal: string
  foodId: number
  foodName: string
  quantity: number
  totalCalories: number
  totalProtein: number
  totalFat: number
  totalCarbo: number
  totalFiber: number
}

interface ReportItem {
  name: string
  total: number
  goal: number
  diff: number
}

const MEAL_OPTIONS = [
  { value: 'BREAKFAST', label: 'Café da Manhã' },
  { value: 'LUNCH', label: 'Almoço' },
  { value: 'SNACK', label: 'Lanche' },
  { value: 'DINNER', label: 'Jantar' }
]

export function DietNew2() {
  const [meals, setMeals] = useState<MealItem[]>([])
  const [selectedMeal, setSelectedMeal] = useState('')
  const [selectedFood, setSelectedFood] = useState('')
  const [quantity, setQuantity] = useState('0.00')
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({
    BREAKFAST: true,
    LUNCH: true,
    SNACK: true,
    DINNER: true
  })

  // Usando SWR para cache e revalidação automática
  const { data: foods = [], isLoading: loadingFoods } = fetcher<Food[]>('/foods')
  const { data: diets = [], isLoading: loadingDiets, mutate: mutateDiets } = fetcher<DietItem[]>('/diets')
  const { data: report = [], isLoading: loadingReport, mutate: mutateReport } = fetcher<ReportItem[]>('/diets/report')

  const loading = loadingFoods || loadingDiets || loadingReport

  useEffect(() => {
    // Definir o título do navegador
    document.title = 'Gerenciador de Dieta | Controle de Macronutrientes'

    return () => {
      // Restaurar título padrão ao sair da página (opcional)
      document.title = 'Diet App'
    }
  }, [])

  useEffect(() => {
    // Converter DietItems para MealItems quando os dados da dieta mudarem
    if (diets.length > 0) {
      const convertedMeals: MealItem[] = diets.map((item: DietItem) => ({
        id: item.id?.toString() || Date.now().toString(),
        meal: item.meal,
        foodId: item.foodId,
        foodName: item.food,
        quantity: item.quantity,
        totalCalories: Math.round(item.calorie),
        totalProtein: Math.round(item.protein * 10) / 10,
        totalFat: Math.round(item.fat * 10) / 10,
        totalCarbo: Math.round(item.carbo * 10) / 10,
        totalFiber: Math.round(item.fiber * 10) / 10,
      }))
      setMeals(convertedMeals)
    }
  }, [diets])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.search-dropdown-container')) {
        setShowDropdown(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        closeModal()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showModal])

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10) // Limitar a 10 resultados

  const selectFood = (food: Food) => {
    setSelectedFood(food.id.toString())
    setSearchTerm(food.name)
    setShowDropdown(false)
  }

  const clearFoodSelection = () => {
    setSelectedFood('')
    setSearchTerm('')
    setShowDropdown(false)
  }

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    // Limpar formulário ao fechar
    setSelectedMeal('')
    setSelectedFood('')
    setQuantity('0.00')
    setSearchTerm('')
    setShowDropdown(false)
  }

  const addMealItem = async () => {
    if (!selectedMeal || !selectedFood || !quantity || parseFloat(quantity) <= 0) {
      alert('Por favor, preencha todos os campos com valores válidos!')
      return
    }

    const food = foods.find(f => f.id === parseInt(selectedFood))
    if (!food) return

    const quantityNum = parseFloat(quantity)
    const multiplier = quantityNum / 100 // A API retorna valores para 100g

    try {
      setSaving(true)

      // Criar o objeto para enviar à API
      const dietData = {
        meal: selectedMeal,
        foodId: food.id,
        quantity: quantityNum
      }

      // Salvar na API
      const response = await api.post('/diets', dietData)

      // Adicionar à lista local se foi salvo com sucesso
      const newMealItem: MealItem = {
        id: response.data.id?.toString() || Date.now().toString(),
        meal: selectedMeal,
        foodId: food.id,
        foodName: food.name,
        quantity: quantityNum,
        totalCalories: Math.round(food.calorie * multiplier),
        totalProtein: Math.round(food.protein * multiplier * 10) / 10,
        totalFat: Math.round(food.fat * multiplier * 10) / 10,
        totalCarbo: Math.round(food.carbo * multiplier * 10) / 10,
        totalFiber: Math.round(food.fiber * multiplier * 10) / 10,
      }

      setMeals([...meals, newMealItem])

      // Revalidar os dados automaticamente
      mutateDiets()
      mutateReport()

      // Reset form e fechar modal
      setSelectedMeal('')
      setSelectedFood('')
      setQuantity('0.00')
      setSearchTerm('')
      setShowDropdown(false)
      setShowModal(false)

    } catch (error) {
      console.error('Erro ao salvar item da dieta:', error)
      alert('Erro ao salvar item da dieta. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const removeMealItem = async (id: string) => {
    const mealItem = meals.find(meal => meal.id === id)
    if (!mealItem) return

    try {
      setSaving(true)

      // Remover da API se tem ID numérico (item salvo)
      if (!isNaN(parseInt(id))) {
        await api.delete(`/diets/${id}`)
      }

      // Remover da lista local
      setMeals(meals.filter(meal => meal.id !== id))

      // Revalidar os dados automaticamente
      mutateDiets()
      mutateReport()

      alert('Item removido com sucesso!')
    } catch (error) {
      console.error('Erro ao remover item da dieta:', error)
      alert('Erro ao remover item da dieta. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const updateMealItem = async (id: string, newQuantity: number) => {
    const mealItem = meals.find(meal => meal.id === id)
    if (!mealItem || isNaN(parseInt(id))) return // Só atualiza itens salvos na API

    const food = foods.find(f => f.id === mealItem.foodId)
    if (!food) return

    try {
      setSaving(true)

      const multiplier = newQuantity / 100

      // Atualizar na API
      await api.patch(`/diets/${id}`, { quantity: newQuantity })

      // Atualizar na lista local
      const updatedMeals = meals.map(meal => {
        if (meal.id === id) {
          return {
            ...meal,
            quantity: newQuantity,
            totalCalories: Math.round(food.calorie * multiplier),
            totalProtein: Math.round(food.protein * multiplier * 10) / 10,
            totalFat: Math.round(food.fat * multiplier * 10) / 10,
            totalCarbo: Math.round(food.carbo * multiplier * 10) / 10,
            totalFiber: Math.round(food.fiber * multiplier * 10) / 10,
          }
        }
        return meal
      })

      setMeals(updatedMeals)

      // Revalidar os dados automaticamente
      mutateDiets()
      mutateReport()

    } catch (error) {
      console.error('Erro ao atualizar item da dieta:', error)
      alert('Erro ao atualizar item da dieta. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const getTotalsByMeal = (meal: string) => {
    const mealItems = meals.filter(item => item.meal === meal)
    return mealItems.reduce(
      (totals, item) => ({
        calories: totals.calories + item.totalCalories,
        protein: totals.protein + item.totalProtein,
        fat: totals.fat + item.totalFat,
        carbo: totals.carbo + item.totalCarbo,
        fiber: totals.fiber + item.totalFiber,
      }),
      { calories: 0, protein: 0, fat: 0, carbo: 0, fiber: 0 }
    )
  }

  const getReportData = () => {
    const nameMap: Record<string, { label: string; color: string; unit: string }> = {
      calorie: { label: 'Calorias', color: 'text-orange-400', unit: '' },
      protein: { label: 'Proteínas', color: 'text-red-400', unit: 'g' },
      fat: { label: 'Gorduras', color: 'text-yellow-400', unit: 'g' },
      carbo: { label: 'Carboidratos', color: 'text-green-400', unit: 'g' },
      fiber: { label: 'Fibras', color: 'text-purple-400', unit: 'g' },
      weight: { label: 'Peso', color: 'text-blue-400', unit: 'kg' }
    }

    const mappedData = report.map(item => ({
      ...item,
      ...nameMap[item.name],
      percentage: item.goal > 0 ? (item.total / item.goal) * 100 : 0,
      isOverGoal: item.diff < 0,
      isUnderGoal: item.diff > 0
    }))

    // Ordenar para mostrar primeiro Peso e Calorias
    const order = ['weight', 'calorie', 'protein', 'fat', 'carbo', 'fiber']
    return mappedData.sort((a, b) => {
      const indexA = order.indexOf(a.name)
      const indexB = order.indexOf(b.name)
      return indexA - indexB
    })
  }

  const toggleMealExpansion = (mealValue: string) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealValue]: !prev[mealValue]
    }))
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white border-b border-gray-600 pb-2">
          Gerenciador de Dieta
        </h1>
        <p className="text-gray-400 mt-2">
          Gerencie suas refeições diárias com controle de macronutrientes
        </p>
      </div>

      {/* Status da conexão */}
      {(loading || saving) && (
        <div className="card bg-blue-900/20 border-blue-700">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            <span className="text-blue-400">
              {loading ? 'Carregando dados...' : 'Salvando alterações...'}
            </span>
          </div>
        </div>
      )}

      {/* Formulário para adicionar refeição - Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal()
            }
          }}
        >
          <div className="bg-gray-950 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Adicionar Item à Refeição
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <Select
                  name="Refeição"
                  value={selectedMeal}
                  onChange={(e) => setSelectedMeal(e.target.value)}
                  options={MEAL_OPTIONS}
                />

                <div className="relative search-dropdown-container">
                  <label className="text-sm text-white">Buscar Alimento</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Digite para buscar alimentos..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setShowDropdown(e.target.value.length > 0)
                        if (e.target.value === '') {
                          clearFoodSelection()
                        }
                      }}
                      onFocus={() => {
                        if (searchTerm.length > 0) {
                          setShowDropdown(true)
                        }
                      }}
                      doesntHaveLabel
                    />
                    {selectedFood && (
                      <button
                        onClick={clearFoodSelection}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {showDropdown && searchTerm.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredFoods.length > 0 ? (
                        filteredFoods.map((food) => (
                          <button
                            key={food.id}
                            onClick={() => selectFood(food)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-600 text-white border-b border-gray-600 last:border-b-0"
                          >
                            <div className="font-medium">{food.name}</div>
                            <div className="text-sm text-gray-400">
                              {food.calorie} cal | P: {food.protein}g | G: {food.fat}g | C: {food.carbo}g
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-400">
                          Nenhum alimento encontrado
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Input
                  type="number"
                  name="Quantidade (g)"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="button-secondary flex-1"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={addMealItem}
                  className="button-primary flex-1"
                  disabled={loading || saving}
                >
                  {saving ? 'Salvando...' : 'Adicionar à Refeição'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante para abrir modal */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
        disabled={loading}
      >
        <Plus size={24} weight="bold" />
      </button>

      {/* Layout principal: Resumo + Refeições */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        {/* Resumo diário com metas */}
        <div className="xl:col-span-4">
          <div className="card">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">
                Resumo Diário & Metas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getReportData().map((item) => (
                <div key={item.name} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-semibold ${item.color}`}>{item.label}</h3>
                    <div className="text-xs text-gray-400">
                      {item.percentage.toFixed(0)}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-300">Atual:</span>
                      <span className={`font-bold ${item.color}`}>
                        {item.total.toFixed(1)}{item.unit}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-300">Meta:</span>
                      <span className="text-white">
                        {item.goal.toFixed(1)}{item.unit}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-gray-300">
                        {item.isOverGoal ? 'Excesso:' : 'Faltam:'}
                      </span>
                      <span className={item.isOverGoal ? 'text-red-400' : 'text-yellow-400'}>
                        {Math.abs(item.diff).toFixed(1)}{item.unit}
                      </span>
                    </div>

                    {/* Barra de progresso */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${item.percentage >= 100
                            ? 'bg-red-400'
                            : item.percentage >= 80
                              ? 'bg-green-400'
                              : 'bg-yellow-400'
                            }`}
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de refeições */}
        <div className="xl:col-span-8">
          <div className="space-y-2">
            {MEAL_OPTIONS.map(mealOption => {
              const mealItems = meals.filter(item => item.meal === mealOption.value)
              const mealTotals = getTotalsByMeal(mealOption.value)

              if (mealItems.length === 0) return null

              return (
                <div key={mealOption.value} className="card">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {mealOption.label}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-400">
                        {mealTotals.calories} cal | {mealTotals.protein.toFixed(1)}g prot | {' '}
                        {mealTotals.fat.toFixed(1)}g gord | {mealTotals.carbo.toFixed(1)}g carb
                      </div>
                      <button
                        onClick={() => toggleMealExpansion(mealOption.value)}
                        className="text-gray-400 hover:text-white transition-all duration-200 w-3"
                        title={expandedMeals[mealOption.value] ? 'Recolher' : 'Expandir'}
                      >
                        <CaretUp
                          size={20}
                          className={`transition-transform duration-200 ${expandedMeals[mealOption.value] ? 'rotate-0' : 'rotate-180'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {expandedMeals[mealOption.value] && (
                    <div className="space-y-2">
                      {mealItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-white">{item.foodName}</div>
                            <div className="text-sm text-gray-300">
                              {item.totalCalories} cal |
                              P: {item.totalProtein.toFixed(1)}g |
                              G: {item.totalFat.toFixed(1)}g |
                              C: {item.totalCarbo.toFixed(1)}g |
                              F: {item.totalFiber.toFixed(1)}g
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {!isNaN(parseInt(item.id)) && (
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={item.quantity}
                                className="w-20 p-1 rounded bg-gray-600 text-white text-sm"
                                onBlur={(e) => {
                                  const newQuantity = parseFloat(e.target.value)
                                  if (newQuantity > 0 && newQuantity !== item.quantity) {
                                    updateMealItem(item.id, newQuantity)
                                  }
                                }}
                                disabled={saving}
                              />
                            )}
                            <button
                              onClick={() => removeMealItem(item.id)}
                              className="text-red-400 hover:text-red-300 font-medium text-sm p-2 rounded bg-red-900/20 hover:bg-red-900/40 transition-all"
                              disabled={saving}
                              title={saving ? 'Removendo...' : 'Remover item'}
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>      {meals.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-lg">Nenhuma refeição adicionada ainda.</p>
          <p className="text-sm">Comece adicionando alimentos às suas refeições!</p>
        </div>
      )}
    </div>
  )
}