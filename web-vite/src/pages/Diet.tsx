import { useState, useEffect } from 'react'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { api } from '@/utils/api'
import { TrashIcon, CaretUpIcon, PlusIcon, CalendarDotsIcon } from '@phosphor-icons/react'
import { useFetcher } from '@/utils/use-fetcher'

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
  date: string
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

// Função para obter a data no timezone local no formato YYYY-MM-DD
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Função para determinar a refeição baseada no horário atual
const getMealByTime = (): string => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = hours * 60 + minutes

  // Antes das 12:00 => Café da Manhã
  if (totalMinutes < 12 * 60) {
    return 'BREAKFAST'
  }
  // 12:00 às 14:59 => Almoço
  if (totalMinutes >= 12 * 60 && totalMinutes < 15 * 60) {
    return 'LUNCH'
  }
  // 15:00 às 17:59 => Lanche
  if (totalMinutes >= 15 * 60 && totalMinutes < 18 * 60) {
    return 'SNACK'
  }
  // 18:00 em diante => Jantar
  return 'DINNER'
}

export function Diet() {
  const [meals, setMeals] = useState<MealItem[]>([])
  const [selectedMeal, setSelectedMeal] = useState(getMealByTime())
  const [selectedFood, setSelectedFood] = useState('')
  const [quantity, setQuantity] = useState('')
  const [selectedDate, setSelectedDate] = useState(getLocalDateString()) // Data atual como padrão
  const [filterDate, setFilterDate] = useState(getLocalDateString()) // Data para filtrar as refeições
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({
    BREAKFAST: true,
    LUNCH: true,
    SNACK: true,
    DINNER: true
  })

  // Usando SWR para cache e revalidação automática
  const { data: foods = [], isLoading: loadingFoods } = useFetcher<Food[]>('/foods')
  const { data: diets = [], isLoading: loadingDiets, mutate: mutateDiets } = useFetcher<DietItem[]>(`/diets?date=${filterDate}`)
  const { data: report = [], isLoading: loadingReport, mutate: mutateReport } = useFetcher<ReportItem[]>(`/diets/report?date=${filterDate}`)

  // Funções para revalidar dados com a data específica
  const revalidateData = () => {
    mutateDiets() // Revalida com a chave atual que já inclui a data
    mutateReport() // Revalida com a chave atual que já inclui a data
  }

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
    } else {
      // Se não há dados para a data filtrada, limpar a lista
      setMeals([])
    }
  }, [diets])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.search-dropdown-container')) {
        setShowDropdown(false)
      }
      if (!target.closest('.date-filter-container') && !target.closest('.date-filter-button')) {
        setShowDateFilter(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
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
    // Definir a data do formulário como a data do filtro atual
    setSelectedDate(filterDate)
    // Definir a refeição baseada no horário atual
    setSelectedMeal(getMealByTime())
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    // Limpar formulário ao fechar
    setSelectedMeal('')
    setSelectedFood('')
    setQuantity('')
    setSelectedDate(getLocalDateString()) // Reset para data atual
    setSearchTerm('')
    setShowDropdown(false)
  }

  const addMealItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedMeal || !selectedFood || !quantity || !selectedDate || Number.parseFloat(quantity) <= 0) {
      alert('Por favor, preencha todos os campos com valores válidos!')
      return
    }

    const food = foods.find(f => f.id === Number.parseInt(selectedFood))
    if (!food) return

    const quantityNum = Number.parseFloat(quantity)
    const multiplier = quantityNum / 100 // A API retorna valores para 100g

    try {
      setSaving(true)

      // Criar o objeto para enviar à API
      const dietData = {
        meal: selectedMeal,
        foodId: food.id,
        quantity: quantityNum,
        date: selectedDate
      }

      // Salvar na API
      const response = await api.post('/diets', dietData)

      // Só adicionar à lista local se a data do item for igual à data do filtro atual
      if (selectedDate === filterDate) {
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
      }

      // Revalidar os dados automaticamente
      revalidateData()

      // Reset form e fechar modal
      setSelectedMeal('')
      setSelectedFood('')
      setQuantity('')
      setSelectedDate(getLocalDateString()) // Reset para data atual
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
      if (!Number.isNaN(Number.parseInt(id))) {
        await api.delete(`/diets/${id}`)
      }

      // Remover da lista local
      setMeals(meals.filter(meal => meal.id !== id))

      // Revalidar os dados automaticamente
      revalidateData()
      console.debug('Item removido da dieta:', id)

    } catch (error) {
      console.error('Erro ao remover item da dieta:', error)
      alert('Erro ao remover item da dieta. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const updateMealItem = async (id: string, newQuantity: number) => {
    const mealItem = meals.find(meal => meal.id === id)
    if (!mealItem || Number.isNaN(Number.parseInt(id))) return // Só atualiza itens salvos na API

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
      revalidateData()

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
    const baseNameMap: Record<string, { label: string; unit: string }> = {
      calorie: { label: 'Calorias', unit: '' },
      protein: { label: 'Proteínas', unit: 'g' },
      fat: { label: 'Gorduras', unit: 'g' },
      carbo: { label: 'Carboidratos', unit: 'g' },
      fiber: { label: 'Fibras', unit: 'g' },
      weight: { label: 'Peso', unit: 'kg' }
    }

    const mappedData = report.map(item => {
      const percentage = item.goal > 0 ? (item.total / item.goal) * 100 : 0
      const isOverGoal = item.diff < 0
      const isUnderGoal = item.diff > 0

      // Definir cores baseadas no status da meta
      let color: string
      let barColor: string

      if (percentage >= 100 && percentage <= 100) {
        // Meta atingida exatamente (100%) - Verde
        color = 'text-green-400'
        barColor = 'bg-green-400'
      } else if (percentage > 100) {
        // Ultrapassou a meta - Vermelho
        color = 'text-red-400'
        barColor = 'bg-red-400'
      } else {
        // Padrão - Azul acinzentado
        color = 'text-slate-400'
        barColor = 'bg-slate-400'
      }

      return {
        ...item,
        ...baseNameMap[item.name],
        color,
        barColor,
        percentage,
        isOverGoal,
        isUnderGoal
      }
    })

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
    <div className="min-h-screen p-4 mx-auto space-y-6 text-white bg-gray-900 lg:p-12 xl:px-32 lg:space-y-8">
      <div className="text-center">
        <h1 className="pb-2 text-2xl font-bold text-white border-b border-gray-600 lg:text-3xl">
          Gerenciador de Dieta
        </h1>
        <p className="mt-2 text-sm text-gray-400 lg:text-base">
          Gerencie suas refeições diárias com controle de macronutrientes
        </p>
      </div>

      {/* Status da conexão */}
      {(loading || saving) && (
        <div className="p-4 border border-blue-700 rounded-lg bg-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-400 rounded-full animate-spin border-t-transparent"></div>
            <span className="text-blue-400">
              {loading ? 'Carregando dados...' : 'Salvando alterações...'}
            </span>
          </div>
        </div>
      )}

      {/* Formulário para adicionar refeição - Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center min-h-screen p-4 bg-black/30 backdrop-blur-sm"

        >
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={addMealItem} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Adicionar Item à Refeição
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-2xl font-bold text-gray-400 cursor-pointer hover:text-white w-min"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <Input
                  type="date"
                  name="Data"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />

                <Select
                  name="Refeição"
                  value={selectedMeal}
                  onChange={(e) => setSelectedMeal(e.target.value)}
                  options={MEAL_OPTIONS}
                />

                <div className="relative search-dropdown-container">
                  <label htmlFor="food-search" className="text-sm text-white">Buscar Alimento</label>
                  <div className="relative">
                    <Input
                      id="food-search"
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
                        type="button"
                        onClick={clearFoodSelection}
                        className="absolute text-gray-400 transform -translate-y-1/2 cursor-pointer right-2 top-1/2 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {showDropdown && searchTerm.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60">
                      {filteredFoods.length > 0 ? (
                        filteredFoods.map((food) => (
                          <button
                            key={food.id}
                            type="button"
                            onClick={() => selectFood(food)}
                            className="w-full px-4 py-2 text-left text-white border-b border-gray-600 cursor-pointer hover:bg-gray-600 last:border-b-0"
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
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 font-bold text-white transition-all duration-200 bg-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 font-bold text-white transition-all duration-200 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={loading || saving}
                >
                  {saving ? 'Salvando...' : 'Adicionar à Refeição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Botão Flutuante para abrir modal */}
      <button
        onClick={openModal}
        className="fixed z-40 flex items-center justify-center text-white transition-all duration-200 bg-blue-600 rounded-full shadow-lg cursor-pointer bottom-6 right-6 w-14 h-14 hover:bg-blue-700 hover:shadow-xl"
        disabled={loading}
      >
        <PlusIcon size={24} weight="bold" />
      </button>

      {/* Botão Filtro de Data */}
      <button
        onClick={() => setShowDateFilter(!showDateFilter)}
        className="fixed z-40 flex items-center justify-center text-white transition-all duration-200 bg-gray-700 rounded-full shadow-lg cursor-pointer date-filter-button bottom-6 left-6 w-14 h-14 hover:bg-gray-600 hover:scale-110 hover:shadow-xl group"
        title="Filtrar por data"
      >
        <CalendarDotsIcon
          size={24}
          className="transition-transform duration-200 group-hover:scale-110"
        />
      </button>

      {/* Card de Filtro por Data */}
      {showDateFilter && (
        <div className="date-filter-container fixed bottom-24 left-6 right-6 sm:right-auto sm:left-6 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-4 z-50 sm:min-w-[280px] sm:max-w-[320px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Filtrar por Data</h3>
            <button
              onClick={() => setShowDateFilter(false)}
              className="text-xl text-gray-400 cursor-pointer hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="filter-date-input" className="block mb-1 text-sm text-gray-300">
                Selecionar data:
              </label>
              <input
                id="filter-date-input"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none [-webkit-appearance:none] [color-scheme:dark]"
              />
            </div>

            <div className="flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-gray-700/50">
              <span className="text-gray-300">Data selecionada:</span>
              {filterDate === getLocalDateString() ? (
                <span className="font-medium text-green-400">Hoje</span>
              ) : (
                <span className="font-medium text-blue-400">
                  {new Date(filterDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilterDate(getLocalDateString())
                }}
                className="flex-1 px-4 py-3 text-base font-medium text-white transition-all duration-200 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 active:bg-blue-800"
              >
                Hoje
              </button>
              <button
                onClick={() => {
                  const yesterday = new Date()
                  yesterday.setDate(yesterday.getDate() - 1)
                  setFilterDate(getLocalDateString(yesterday))
                }}
                className="flex-1 px-4 py-3 text-base font-medium text-white transition-all duration-200 bg-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 active:bg-gray-800"
              >
                Ontem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout principal: Resumo + Refeições */}
      {meals.length === 0 && !loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="py-12 text-center text-gray-400">
            <div className="mb-4 text-6xl">🍽️</div>
            <p className="text-lg font-semibold">Nenhuma refeição adicionada ainda.</p>
            <p className="mt-2 text-sm">Comece adicionando alimentos às suas refeições!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
         
          {/* Lista de refeições */}
          <div className="lg:col-span-8">
            <div className="space-y-2">
              {MEAL_OPTIONS.map(mealOption => {
                const mealItems = meals.filter(item => item.meal === mealOption.value)
                const mealTotals = getTotalsByMeal(mealOption.value)

                if (mealItems.length === 0) return null

                return (
                  <div key={mealOption.value} className="p-4 transition-all duration-300 border shadow-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-700/50 rounded-2xl hover:shadow-2xl hover:border-gray-600/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold text-white lg:text-lg">
                        {mealOption.label}
                      </h3>
                      <button
                        onClick={() => toggleMealExpansion(mealOption.value)}
                        className="flex-shrink-0 text-gray-400 transition-all duration-200 cursor-pointer hover:text-white w-min"
                        title={expandedMeals[mealOption.value] ? 'Recolher' : 'Expandir'}
                      >
                        <CaretUpIcon
                          size={20}
                          className={`transition-transform duration-200 ${expandedMeals[mealOption.value] ? 'rotate-0' : 'rotate-180'
                            }`}
                        />
                      </button>
                    </div>
                    <div className="mb-3 text-sm leading-relaxed text-gray-400">
                      {mealTotals.calories} cal | {mealTotals.protein.toFixed(1)}g prot | {' '}
                      {mealTotals.fat.toFixed(1)}g gord | {mealTotals.carbo.toFixed(1)}g carb
                    </div>

                    {expandedMeals[mealOption.value] && (
                      <div className="space-y-2">
                        {mealItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{item.foodName}</div>
                              <div className="text-sm text-gray-300">
                                {item.totalCalories} cal |
                                P: {item.totalProtein.toFixed(1)}g |
                                G: {item.totalFat.toFixed(1)}g |
                                C: {item.totalCarbo.toFixed(1)}g |
                                F: {item.totalFiber.toFixed(1)}g
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {!Number.isNaN(Number.parseInt(item.id)) && (
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  defaultValue={item.quantity}
                                  className="w-20 p-1 text-sm text-white bg-gray-600 rounded"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const newQuantity = Number.parseFloat((e.target as HTMLInputElement).value)
                                      if (newQuantity > 0 && newQuantity !== item.quantity) {
                                        updateMealItem(item.id, newQuantity)
                                      }
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const newQuantity = Number.parseFloat(e.target.value)
                                    if (newQuantity > 0 && newQuantity !== item.quantity) {
                                      updateMealItem(item.id, newQuantity)
                                    }
                                  }}
                                  disabled={saving}
                                />
                              )}
                              <button
                                onClick={() => removeMealItem(item.id)}
                                className="p-2 text-sm font-medium text-red-400 transition-all rounded cursor-pointer hover:text-red-300 bg-red-900/20 hover:bg-red-900/40"
                                disabled={saving}
                                title={saving ? 'Removendo...' : 'Remover item'}
                              >
                                <TrashIcon size={16} />
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

           {/* Resumo diário com metas - Fixo no topo em mobile, lateral em desktop */}
          <div className=" lg:col-span-4 lg:sticky lg:top-4 lg:h-fit">
            <div className="p-4 border shadow-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-700/50 rounded-2xl lg:p-6">
              <div className="mb-4 lg:mb-6">
                <h2 className="text-lg font-semibold text-white lg:text-xl">
                  Resumo Diário & Metas
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 xl:grid-cols-2 lg:gap-4">
                {getReportData().map((item) => (
                  <div key={item.name} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${item.color}`}>{item.label}</h3>
                      <div className="text-xs text-gray-400">
                        {item.percentage.toFixed(0)}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Atual:</span>
                        <span className={`font-bold ${item.color}`}>
                          {item.total.toFixed(2)}{item.unit}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Meta:</span>
                        <span className="text-white">
                          {item.goal.toFixed(2)}{item.unit}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">
                          {item.isOverGoal ? 'Excesso:' : 'Faltam:'}
                        </span>
                        <span className={item.color}>
                          {Math.abs(item.diff).toFixed(2)}{item.unit}
                        </span>
                      </div>

                      {/* Barra de progresso */}
                      <div className="mt-3">
                        <div className="w-full h-2 bg-gray-600 rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${item.barColor}`}
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

        </div>
      )}
    </div>
  )
}