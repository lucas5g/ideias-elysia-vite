import { getListAndFilter, baseUrl, filterList, showLoadingButton, hideLoadingButton, getFoodById } from './utils.js'

document.addEventListener('DOMContentLoaded', async () => {
  await getListAndFilter()

})

document.addEventListener('submit', async (e) => {
  e.preventDefault()

  const id = document.querySelector('#id').value
  const name = document.querySelector('#name').value
  const protein = Number(document.querySelector('#protein').value)
  const carbo = Number(document.querySelector('#carb').value)
  const fat = Number(document.querySelector('#fat').value)
  const fiber = Number(document.querySelector('#fiber').value)
  const calorie = Number(document.querySelector('#calorie').value)

  showLoadingButton()
  await fetch(`${baseUrl}/foods/${id}`, {
    method: id ? 'PATCH' : 'POST',
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

document.addEventListener('reset', () => {

  const url = new URL(window.location)
  url.searchParams.delete('id')
  window.history.pushState(null, null, url)

  document.querySelector('.button-delete').classList.add('hidden')
})


document.querySelector('.button-delete').addEventListener('click', async () => {
  const id = document.querySelector('#id').value
  document.querySelector('.button-delete').classList.add('hidden')
  await fetch(`${baseUrl}/foods/${id}`, {
    method: 'DELETE'
  })
  // const url = new URL(window.location)
  // url.searchParams.delete('id')
  // window.history.pushState(null, null, url)
})