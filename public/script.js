async function getList(search) {
  const res = await fetch('https://n8n.dizelequefez.com.br/webhook/foods')

  const data = await res.json()

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

document.addEventListener('DOMContentLoaded', async () => {
  await getList()
})

// document
// document.querySe