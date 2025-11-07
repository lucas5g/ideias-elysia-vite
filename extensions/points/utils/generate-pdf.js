export function generatePDF(data) {

  

  return 'PDF generated successfully!'
}

const dataTest = [
  {
    "name": "01 - Sábado",
    "hours": {
      "start": " ",
      "end": " "
    }
  },
  {
    "name": "02 - Domingo",
    "hours": {
      "start": " ",
      "end": " "
    }
  },
  {
    "name": "03 - Segunda Feira",
    "hours": {
      "start": "09:00",
      "lunchStart": "12:13",
      "lunchEnd": "13:31",
      "end": "18:26"
    }
  },
  {
    "name": "04 - Terça Feira",
    "hours": {
      "start": "09:11",
      "lunchStart": "12:03",
      "lunchEnd": "13:09",
      "end": "18:18"
    }
  },
  {
    "name": "05 - Quarta Feira",
    "hours": {
      "start": "09:04",
      "lunchStart": "13:50",
      "lunchEnd": "15:45",
      "end": "19:20"
    }
  },
  {
    "name": "06 - Quinta Feira",
    "hours": {
      "start": "09:22",
      "lunchStart": "13:20",
      "lunchEnd": "14:25",
      "end": "18:42"
    }
  }
]

const res = generatePDF(dataTest)
console.log(res)
