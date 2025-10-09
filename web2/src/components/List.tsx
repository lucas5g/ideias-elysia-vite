import { use, useEffect, useState } from "react"

import { api } from "@/utils/api"
import type { FieldInterface } from '@/utils/interfaces';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Loading } from './Loading';


interface Props {
  fields: FieldInterface
}
interface ItemInterface {
  id: number;
  [key: string]: string | number;
}
export function List({ fields }: Readonly<Props>) {

  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
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

  if (!list) {
    return <Loading />
  }

  const search = searchParams.get('search') || ''

  const filteredList = list.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(search)
    )
  );

  return (
    <div className="card">
      <h1>
        List
      </h1>
      <input
        placeholder="Search"
        className="input"
        onChange={(e) => setSearchParams({ search: e.target.value })}
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
          {filteredList?.map((row) => (

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