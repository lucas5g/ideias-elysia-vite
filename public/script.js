function showLoading() {
  document.querySelector('#card-loading').classList.remove('hidden')
  document.querySelector('#card-list').classList.add('hidden')
}

function hideLoading() {
  document.querySelector('#card-loading').classList.add('hidden')
  document.querySelector('#card-list').classList.remove('hidden')
}

function showLoadingButton() {
  document.querySelector('.button-primary').textContent = 'Saving...'
  document.querySelector('.button-primary').disabled = true
}

function hideLoadingButton() {
  document.querySelector('.button-primary').textContent = 'Save'
  document.querySelector('.button-primary').disabled = false
}
async function getListAndFilter() {
  await getList()
  const search = new URL(window.location).searchParams.get('search') || ''
  document.querySelector('#search-input').value = search
  filterList(search)
}

export async function getFoodByName(name) {

  const rows = document.querySelectorAll('tbody tr')
  rows.forEach((row) => row.classList.remove('bg-gray-800'));

  const foodElement = Array.from(rows)
    .find((tr) => tr.querySelector('td').textContent === name)

  foodElement.classList.add('bg-gray-800');
  const food = {
    name: foodElement.querySelector('td:nth-child(1)').textContent,
    protein: foodElement.querySelector('td:nth-child(2)').textContent,
    fat: foodElement.querySelector('td:nth-child(3)').textContent,
    carbo: foodElement.querySelector('td:nth-child(4)').textContent,
    fiber: foodElement.querySelector('td:nth-child(5)').textContent,
    calorie: foodElement.querySelector('td:nth-child(6)').textContent,
  }


  document.querySelector('#name').value = food.name
  document.querySelector('#protein').value = food.protein
  document.querySelector('#fat').value = food.fat
  document.querySelector('#carb').value = food.carbo
  document.querySelector('#fiber').value = food.fiber
  document.querySelector('#calorie').value = food.calorie


  const url = new URL(window.location)
  url.searchParams.set('name', name)
  window.history.pushState({}, '', url)

}
async function getList() {
  showLoading()

  const res = await fetch('https://n8n.dizelequefez.com.br/webhook/foods')

  const data = await res.json()
  hideLoading()

  document.querySelector('tbody').innerHTML = ''
  for (const row of data) {
    const html = `
      <tr onclick="getFoodByName('${row.name}')">
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


function filterList(search) {

  const url = new URL(window.location)
  url.searchParams.set('search', search)
  window.history.pushState({}, '', url)

  const rows = document.querySelectorAll('tbody tr')

  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td'))
    const matches = cells.some(cell => cell.textContent.toLowerCase().includes(search))
    row.style.display = matches ? '' : 'none' // Mostra ou oculta a linha
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  await getListAndFilter()
  const nameParam = new URL(window.location).searchParams.get('name') || ''
  getFoodByName(nameParam)

})

document.addEventListener('submit', async (e) => {
  e.preventDefault()
  const name = document.querySelector('#name').value
  const protein = document.querySelector('#protein').value
  const carbo = document.querySelector('#carb').value
  const fat = document.querySelector('#fat').value
  const fiber = document.querySelector('#fiber').value
  const calorie = document.querySelector('#calorie').value

  showLoadingButton()

  await fetch('https://n8n.dizelequefez.com.br/webhook/foods', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      protein,
      carbo,
      fat,
      fiber,
      calorie
    })
  })
  await getListAndFilter()
  hideLoadingButton()
})

document.querySelector('#search-input').addEventListener('input', () => {
  const search = document.querySelector('#search-input').value.toLowerCase()

  filterList(search)
})

window.getFoodByName = getFoodByName