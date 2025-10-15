import { getListAndFilter, baseUrl, filterList, showLoadingButton, hideLoadingButton, buttonDelete, getReport, getFoods } from './utils.js'

document.addEventListener('DOMContentLoaded', async () => {

  await getFoods()
  await getListAndFilter()
  await getReport()

})

document.addEventListener('submit', async (e) => {
  e.preventDefault()

  const id = document.querySelector('#id').value
  const meal = document.querySelector('#meal').value
  const foodId = document.querySelector('#foodId').value
  const quantity = Number(document.querySelector('#quantity').value)

  const payload = JSON.stringify({
    meal,
    foodId: Number(foodId),
    quantity
  })

  showLoadingButton()
  await fetch(`${baseUrl}/diets/${id}`, {
    method: id ? 'PATCH' : 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: payload
  })
  await getReport()
  await getListAndFilter()
  hideLoadingButton()

  if (!id) {
    document.querySelector('form').reset()
  }
})

document.querySelector('#search-input').addEventListener('input', () => {
  const search = document.querySelector('#search-input').value.toLowerCase()

  filterList(search)
})

document.addEventListener('reset', () => {

  const url = new URL(window.location)
  url.searchParams.delete('id')
  window.history.pushState(null, null, url)

  buttonDelete.classList.add('hidden')

  const rows = document.querySelectorAll('tbody tr')
  rows.forEach((row) => row.classList.remove('bg-gray-800'));

})



buttonDelete.addEventListener('click', async () => {

  // const confirm = window.confirm('Are you sure you want to delete this item?')
  // if (!confirm) return

  const id = document.querySelector('#id').value


  await fetch(`${baseUrl}/diets/${id}`, {
    method: 'DELETE'
  })

  buttonDelete.classList.add('hidden')

  const url = new URL(window.location)
  url.searchParams.delete('id')
  window.history.pushState(null, null, url)

  await Promise.all([
    getListAndFilter(),
    getReport()
  ])

  document.querySelector('form').reset()
})