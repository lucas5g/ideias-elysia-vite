function main() {
  console.log('passou no load do iframe')
  const nodeList = document.querySelectorAll('#x-widget-50 > div > div > div.GB2UA-DDDUB > div.GB2UA-DDOSB > table > tbody:nth-child(2) > tr  ')
  console.log('nodeList', nodeList)
  if (nodeList.length === 0) {
    return
  }

  const days = []

  for (const row of nodeList) {
    const tds = row.querySelectorAll('td')

    const name = tds[0].innerText
    const hours = tds[3].innerText

    days.push({
      name,
      hours
    })
  }
  console.log(days)
}

setTimeout(main, 2000)