export const baseUrl = 'https://api.dizelequefez.com.br'
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

  if(id){
    getFoodById(id)
  }
}

export async function getFoodById(id) {
  console.log({ id })

  document.querySelector('.ph-trash').classList.remove('hidden')

  const rows = document.querySelectorAll('tbody tr')
  rows.forEach((row) => row.classList.remove('bg-gray-800'));

  const foodElement = Array.from(rows)
    .find((tr) => tr.getAttribute('data-id') === id)

  if (!foodElement) return

  foodElement.classList.add('bg-gray-800');
  const food = {
    name: foodElement.querySelector('td:nth-child(1)').textContent,
    protein: foodElement.querySelector('td:nth-child(2)').textContent,
    fat: foodElement.querySelector('td:nth-child(3)').textContent,
    carbo: foodElement.querySelector('td:nth-child(4)').textContent,
    fiber: foodElement.querySelector('td:nth-child(5)').textContent,
    calorie: foodElement.querySelector('td:nth-child(6)').textContent,
  }

  document.querySelector('#id').value = id
  document.querySelector('#name').value = food.name
  document.querySelector('#protein').value = food.protein
  document.querySelector('#fat').value = food.fat
  document.querySelector('#carb').value = food.carbo
  document.querySelector('#fiber').value = food.fiber
  document.querySelector('#calorie').value = food.calorie

  document.querySelector('.layout').scrollTo({ top: 0, behavior: 'smooth' });

  const url = new URL(window.location)
  url.searchParams.set('id', id)
  window.history.pushState({}, '', url)

}
async function getList() {
  showLoading()

  const res = await fetch(baseUrl + '/foods')

  const data = await res.json()
  hideLoading()

  document.querySelector('tbody').innerHTML = ''
  for (const row of data) {
    const html = `
      <tr data-id="${row.id}" onclick="getFoodById('${row.id}')">
        <td>${row.name}</td>
        <td>${row.protein}</td>
        <td>${row.fat}</td>
        <td>${row.carbo}</td>
        <td>${row.fiber}</td>
        <td class="text-right">${row.calorie}</td>
      </tr>
      `
    document.querySelector('tbody').innerHTML += html
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
  if(!value) return

  const url = new URL(window.location)
  url.searchParams.set(name, value)
  window.history.pushState({}, '', url)
}

window.getFoodById = getFoodById