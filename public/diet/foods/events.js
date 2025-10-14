import { getListAndFilter, baseUrl, filterList, showLoadingButton, hideLoadingButton, buttonDelete } from '../utils.js'

document.addEventListener('DOMContentLoaded', async () => {
  await getListAndFilter()

  // fetch('navbar.html')
  //   .then(response => response.text())
  //   .then(data => {
  //     document.querySelector('body').insertAdjacentHTML('afterbegin', data)
  //   })

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

  buttonDelete.classList.add('hidden')

})



buttonDelete.addEventListener('click', async () => {

  const confirm = window.confirm('Are you sure you want to delete this item?')
  if (!confirm) return

  const id = document.querySelector('#id').value

  await fetch(`${baseUrl}/foods/${id}`, {
    method: 'DELETE'
  })

  buttonDelete.classList.add('hidden')

  const url = new URL(window.location)
  url.searchParams.delete('id')
  window.history.pushState(null, null, url)

  await getListAndFilter()

  document.querySelector('form').reset()
})