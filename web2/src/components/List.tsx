import { use, useEffect, useState } from "react"

import { api } from "@/utils/api"
import type { FieldInterface } from '@/utils/interfaces';
import { useNavigate } from 'react-router';


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

  useEffect(() => {
    api.get('/foods').then(response => {
      setList(response.data)
    })

  }, [])

  function handleSelect(id: number) {
    navigate(`/foods/${id}`)    
  }

  return (
    <div className="card">
      <h1>
        List
      </h1>
      <input type="text" placeholder="Search" className="input" id="search-input" />
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
                key={row.id}>
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