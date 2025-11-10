function main() {
  const hours = document.querySelectorAll('#painel > center:nth-child(9) > div > table > tbody > tr:nth-child(2) > td')

  // alert('Horas encontradas: ' + hours.length)

  hours.forEach(hour => {
    // alert(hour.innerText)
    // document.writeln(hour.innerText)
  })

}

setTimeout(main, 2000);