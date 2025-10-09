import { use, useEffect, useState } from "react"

import { api } from "@/utils/api"
import type { FieldInterface } from '@/utils/interfaces';
import { useNavigate, useParams } from 'react-router';
import { Loading } from './Loading';


interface Props {
  fields: FieldInterface
}
interface ItemInterface {
  id: number;
  [key: string]: string | number;
}
export function List({ fields }: Readonly<Props>) {

  const [list, setList] = useState<ItemInterface[]>()
  const headers = Object.keys(fields)
  let navigate = useNavigate();
  const { id } = useParams();


  useEffect(() => {

    api.get('/foods').then(response => {
      // localStorage.setItem('foods', JSON.stringify(response.data))
      setList(response.data)
    })

  }, [])

  function handleSelect(id: number) {
    navigate(`/foods/${id}`)
  }

  if (!list) {
    return <Loading />
  }

  return (
    <div className="card">
      <h1>
        List
      </h1>
      <input
        placeholder="Search"
        className="input"
        onChange={(e) => {

          // const rows = document.querySelectorAll('tbody tr')
          // rows.forEach(row => {
          //   const cells = Array.from(row.querySelectorAll('td'))
          //   const matches = cells.some(cell => cell.textContent.toLowerCase().includes(e.target.value.toLowerCase()))

          //   row.style.display = matches ? '' : 'none' // Mostra ou oculta a linha
        }}
      />
      <table>
        <thead>
          <tr>
            {headers.map((head) => (
              <th key={head}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list?.map((row) => (

            <tr
              onClick={() => handleSelect(row.id)}
              key={row.id}
              className={row.id === Number(id) ? 'bg-gray-600' : ''}
              >
              {headers.map((head) => (
                <td key={head}>

                  {row[head.toLowerCase()]}
                </td>
              ))}
            </tr>
          ))}

        </tbody>
      </table>
    </div >
  )
}