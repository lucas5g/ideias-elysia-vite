import { useEffect, useState } from "react"
import type { InputProps } from "./Input"
import { api } from "@/utils/api"

export type FieldType = Record< string, InputProps>
interface Props {
  fields: FieldType
}
interface  ItemInterface {
  id: number;
  [key: string]: string | number;
}
export function List({ fields }: Readonly<Props>) {

  const [list, setList] = useState<ItemInterface[]>()
  const headers = Object.keys(fields)

  useEffect(() => {
    api.get('/foods').then(response => {
      setList(response.data)
    })

  }, [])

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
            <tr key={row.id}>
              {headers.map((head) => (
                <td key={head}>
                  {row[head.toLowerCase()]}
                </td>
              ))}
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  )
}