function getDays() {

  const nodeList = document.querySelectorAll('#x-widget-50 > div > div > div.GB2UA-DDDUB > div.GB2UA-DDOSB > table > tbody:nth-child(2) > tr  ')

  if (nodeList.length === 0) {
    return
  }

  const days = []

  for (const row of nodeList) {
    const tds = row.querySelectorAll('td')

    const name = tds[0].innerText
    const hours = tds[3].innerText.split(' ')

    days.push({
      name,
      hours: {
        start: hours[0],
        lunchStart: hours[1],
        lunchEnd: hours.at(-2),
        end: hours.at(-1),
      }
    })
  }

  return days
}

function generatePDF(data) {

  console.log(data)

  return 'PDF generated successfully!'
}

function main() {


  const header = document.querySelector('h1#tituloForm')

  if (header.innerText !== 'Controle da Frequência') {
    return
  }

  const buttonElement = `
  <button style="position: fixed; bottom: 20px; right: 20px; border-radius: 8px; background-color: #4CAF50; color: white; padding: 10px 15px; font-size: 16px; cursor: pointer; border:none" id="generate-pdf-button">
  Gerar PDF
  </button>
  `
  document.body.insertAdjacentHTML('afterend', buttonElement)


  const button = document.querySelector('#generate-pdf-button')
  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = '#45a049'
  })
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = '#4CAF50'
  })
  button.addEventListener('click', () => {
    const data = getDays()
    generatePDF(data)
  })
}

setTimeout(main, 2000);

