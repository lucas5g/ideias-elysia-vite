export const baseUrl = 'https://api.dizelequefez.com.br'
// export const baseUrl = 'http://localhost:3000'

export const buttonDelete = document.querySelector('.ph-trash')

function showLoading() {
  document.querySelector('#card-loading').classList.remove('hidden')
  document.querySelector('#card-list').classList.add('hidden')
}

function hideLoading() {
  document.querySelector('#card-loading').classList.add('hidden')
  document.querySelector('#card-list').classList.remove('hidden')
}

export function showLoadingButton() {
  document.querySelector('.button-primary').textContent = 'Saving...'
  document.querySelector('.button-primary').disabled = true
}

export function hideLoadingButton() {
  document.querySelector('.button-primary').textContent = 'Save'
  document.querySelector('.button-primary').disabled = false
}
export async function getListAndFilter() {
  await getList()

  const url = new URL(window.location)

  const search = url.searchParams.get('search') || ''
  document.querySelector('#search-input').value = search
  filterList(search)
  const id = url.searchParams.get('id')

  if (id) {
    getItemById(id)
  }
}

export async function getItemById(id) {


  buttonDelete.classList.remove('hidden')

  const rows = document.querySelectorAll('tbody tr')
  rows.forEach((row) => row.classList.remove('bg-gray-800'));

  const itemElement = Array.from(rows)
    .find((tr) => tr.getAttribute('data-id') === id)

  if (!itemElement) return

  itemElement.classList.add('bg-gray-800');
  const item = {
    meal: itemElement.querySelector('td:nth-child(1)').textContent,
    food: itemElement.querySelector('td:nth-child(2)').textContent,
    quantity: itemElement.querySelector('td:nth-child(3)').textContent,
  }

  const optionsFood = Array.from(document.querySelector('#foodId').options)

  document.querySelector('#id').value = id
  document.querySelector('#meal').value = item.meal
  document.querySelector('#foodId').value = document.querySelector('#foodId').value = Array.from(document.querySelector('#foodId').options)
    .find(option => option.text === item.food)?.value || ''

  document.querySelector('#quantity').value = item.quantity
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const url = new URL(window.location)
  url.searchParams.set('id', id)
  window.history.pushState({}, '', url)

}
async function getList() {
  showLoading()

  const res = await fetch(baseUrl + '/diets')

  const data = await res.json()
  hideLoading()

  document.querySelector('#items-table tbody').innerHTML = ''
  for (const row of data) {
    const html = `
      <tr data-id="${row.id}" onclick="getItemById('${row.id}')">
        <td>${row.meal}</td>
        <td>${row.food}</td>
        <td>${row.quantity}</td>
        <td>${row.protein}</td>
        <td>${row.fat}</td>
        <td>${row.carbo}</td>
        <td>${row.fiber}</td>
        <td class="text-right">${row.calorie}</td>
      </tr>
      `
    document.querySelector('#items-table tbody').innerHTML += html
  }

}


export function filterList(search) {

  pushState('search', search)

  const rows = document.querySelectorAll('tbody tr')

  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td'))
    const matches = cells.some(cell => cell.textContent.toLowerCase().includes(search))
    row.style.display = matches ? '' : 'none' // Mostra ou oculta a linha
  })
}

export function pushState(name, value) {
  if (!value) return

  const url = new URL(window.location)
  url.searchParams.set(name, value)
  window.history.pushState({}, '', url)
}


export async function getReport() {

  const res = await fetch(`${baseUrl}/diets/report`)
  const data = await res.json()
  document.querySelector('#report-table tbody').innerHTML = ''
  for (const row of data) {
    const html = `
      <tr>
        <td>${row.name}</td>
        <td>${row.total}</td>
        <td>${row.goal}</td>
        <td>${row.diff}</td>
      </tr>
    `
    document.querySelector('#report-table tbody').innerHTML += html
  }
}

export async function getFoods() {
  const res = await fetch(`${baseUrl}/foods`)
  const data = await res.json()

  const foodIdSelect = document.querySelector('#foodId')
  foodIdSelect.innerHTML = '<option value="" disabled selected>Select Food</option>'
  data.forEach(food => {
    foodIdSelect.innerHTML += `<option value="${food.id}">${food.name}</option>`
  })

}

window.getItemById = getItemById
// window.getFoodById = getFoodById
