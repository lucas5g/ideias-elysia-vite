import { getListAndFilter, baseUrl, filterList } from './utils.js'

document.addEventListener('DOMContentLoaded', async () => {
  await getListAndFilter()
  const nameParam = new URL(window.location).searchParams.get('name') || ''
  // getFoodByName(nameParam)

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

  await fetch(baseUrl + '/fooods', {
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

