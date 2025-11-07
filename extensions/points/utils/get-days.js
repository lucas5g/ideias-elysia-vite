export function getDays() {

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