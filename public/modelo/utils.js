export const baseUrl = environments(localStorage.getItem('environment'))
function showLogin() {
  document.querySelector('#main-login').classList.remove('hidden')
  document.querySelector('#main').classList.add('hidden')
  document.querySelector('nav').classList.add('hidden')

}
export function disabledButton(button) {
  document.getElementById(button).disabled = true
  document.getElementById(button).innerText = 'Loading'
}

export function enableButton(button, text) {
  document.getElementById(button).disabled = false
  document.getElementById(button).innerText = text
}


function autoResize(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
  el.style.overflowX = "hidden";
}

export async function getModuleById(id) {

  window.history.pushState(null, null, `?id=${id}`)
  setTableRowActive(id)

  const response = await fetch(`${baseUrl}/candidato/service/modelos/${id}`, {
    headers: {
      Authorization: localStorage.getItem('token')
    }
  })

  const data = await response.json()

  document.querySelector('#co_seq_modelo').value = data.dados.co_seq_modelo
  document.getElementById('no_modelo').value = data.dados.no_modelo

  const textarea = document.getElementById('ds_conteudo_modelo')
  textarea.value = data.dados.ds_conteudo_modelo
  autoResize(textarea)

  document.getElementById('render').innerHTML = data.dados.ds_conteudo_modelo;

  document.querySelector('#create').style.display = 'none'
  document.querySelector('#update').style.display = 'block'

}


async function handleErrors(error) {
  const data = await error.json()
  console.debug('debug ', data)
  // alert(data.message)
  showLogin()
}

export async function getModules() {

  try {

    const response = await fetch(`${baseUrl}/candidato/service/modelos`, {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    })

    if (response.status !== 200) {
      await handleErrors(response)
      return
    }

    const data = await response.json()
    document.querySelector('tbody').innerHTML = ''

    for (const row of data.dados) {

      const html = `
      <tr onclick="getModuleById(${row.co_seq_modelo})" data-id="${row.co_seq_modelo}">
      <td>${row.co_seq_modelo}</td>
      <td>${row.no_modelo}</td>
      </tr>
      `
      document.querySelector('tbody').innerHTML += html
    }
  }catch{
    showLogin()
  }
}

export function setTableRowActive(id) {
  document.querySelectorAll('tbody>tr').forEach(row => row.classList.remove('bg-gray-700'));
  document.querySelector(`tbody>tr[data-id="${id}"]`).classList.add('bg-gray-700')
}

export function environments(env) {
  const envs = {
    'dev': 'https://dev.gerais.mg.def.br',
    'tst': 'https://tst.gerais.mg.def.br',
    'hml': 'https://hml.gerais.mg.def.br',
    'pre-prod': 'https://pre-prod.gerais.mg.def.br',
    'prod': 'https://gerais.defensoria.mg.def.br/'
  }

  return envs[env]
}


window.getModuleById = getModuleById
window.autoResize = autoResize