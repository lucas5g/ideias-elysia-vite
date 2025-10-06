function showLoading() {
  document.querySelector('#card-loading').classList.remove('hidden')
  document.querySelector('#card-list').classList.add('hidden')
}

function hideLoading() {
  document.querySelector('#card-loading').classList.add('hidden')
  document.querySelector('#card-list').classList.remove('hidden')
}


async function getList(search) {
  showLoading()
  const res = await fetch('https://n8n.dizelequefez.com.br/webhook/foods')

  const data = await res.json()
  hideLoading()

  const filteredData = search ? data.filter(item => item.name.includes(search)) : data

  document.querySelector('tbody').innerHTML = ''
  for (const row of filteredData) {
    const html = `
      <tr data-id="${row.id}">
        <td>${row.name}</td>
        <td>${row.protein}</td>
        <td>${row.carbo}</td>
        <td>${row.fat}</td>
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
  await getList()
  const search = new URL(window.location).searchParams.get('search') || ''
  document.querySelector('#search-input').value = search
  filterList(search)
})

document.addEventListener('submit', async (e) => {
  e.preventDefault()
  const name = document.querySelector('#name').value
  const protein = document.querySelector('#protein').value
  const carbo = document.querySelector('#carb').value
  const fat = document.querySelector('#fat').value
  const fiber = document.querySelector('#fiber').value
  const calorie = document.querySelector('#calorie').value

  console.log({ name, protein, carbo, fat, fiber, calorie })

  const res = await fetch('https://n8n.dizelequefez.com.br/webhook/foods', {
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
})

document.querySelector('#search-input').addEventListener('input', () => {
  const search = document.querySelector('#search-input').value.toLowerCase()

  filterList(search)
})
// document.addE