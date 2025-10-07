import { getModules, getModuleById, enableButton, disabledButton, baseUrl, setTableRowActive } from './utils.js'

document.getElementById('ds_conteudo_modelo').addEventListener('input', (event) => {
  document.getElementById('render').innerHTML = event.target.value;
});

document.querySelector('#cancel').addEventListener('click', () => {
  document.getElementById('co_seq_modelo').value = ''
  document.getElementById('no_modelo').value = ''
  document.getElementById('render').innerHTML = ''
  const textarea = document.getElementById('ds_conteudo_modelo')
  textarea.value = ''
  autoResize(textarea)

  document.querySelector('#create').style.display = 'block'
  document.querySelector('#update').style.display = 'none'
  window.history.pushState(null, null, window.location.pathname)

  document.querySelectorAll('tbody>tr').forEach(row => row.classList.remove('bg-gray-700'));


})

document.querySelector('#create').addEventListener('click', () => {

  fetch(`${baseUrl}/candidato/service/modelos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('token')
    },
    body: JSON.stringify({
      no_modelo: document.getElementById('no_modelo').value,
      ds_conteudo_modelo: document.getElementById('ds_conteudo_modelo').value
    })
  }).then(() => {
    getModules()
    document.querySelector('#cancel').click()
  })

})

document.querySelector('#update').addEventListener('click', async () => {

  const co_seq_modelo = document.getElementById('co_seq_modelo').value;

  disabledButton('update')
  await fetch(`${baseUrl}/candidato/service/modelos/${co_seq_modelo}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('token')
    },
    body: JSON.stringify({
      no_modelo: document.getElementById('no_modelo').value,
      ds_conteudo_modelo: document.getElementById('ds_conteudo_modelo').value
    })
  })

  await getModules()
  setTableRowActive(co_seq_modelo)
  enableButton('update', 'Update')


})

document.addEventListener('submit', async (event) => {
  event.preventDefault()

  const cpf = document.getElementById('cpf').value
  const senha = document.getElementById('senha').value

  try {

    disabledButton('login-button')

    const res = await fetch(`${baseUrl}/scsdp/service/login/interno`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cpf,
        senha
      })
    })
    const data = await res.text()

    localStorage.setItem('token', `Bearer ${data}`)
    window.location.reload()

  } catch (e) {
    console.error(e)
    alert('Erro ao logar, verifique suas credenciais.')
    enableButton('login-button', 'Login')
    return
  }
})

document.addEventListener('DOMContentLoaded', async () => {

  await getModules()

  const id = new URLSearchParams(window.location.search).get('id')
  if (id) {
    await getModuleById(id)
  }
})

document.querySelector('#button-pdf').addEventListener('click', async () => {
  const no_modelo = document.getElementById('no_modelo').value
  const ds_conteudo_modelo = document.getElementById('ds_conteudo_modelo').value

  disabledButton('button-pdf')
  const res = await fetch(`${baseUrl}/candidato/service/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('token')
    },
    body: JSON.stringify({
      html: ds_conteudo_modelo
    })
  })

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${no_modelo}.pdf`
  link.click()

  enableButton('button-pdf', 'PDF')
})

