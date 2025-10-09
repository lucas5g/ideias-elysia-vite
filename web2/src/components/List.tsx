import { useEffect, useState } from "react"
import { api } from "@/utils/api"
import type { FieldInterface } from '@/utils/interfaces';
import { useSearchParams } from 'react-router';
import { Loading } from './Loading';
import { Input } from './Input';


interface Props {
  fields: FieldInterface
  resource: string
}
interface ItemInterface {
  id: number;
  [key: string]: string | number;
}
export function List({ fields, resource }: Readonly<Props>) {


  const [searchParams, setSearchParams] = useSearchParams();
  const [list, setList] = useState<ItemInterface[]>()
  const id = searchParams.get('id')


  const headers = Object.keys(fields);

  useEffect(() => {

    api.get(resource).then(response => {
      setList(response.data)
    })

  }, [])



  function handleSelect(id: number) {

    // pushParams('id', String(id))
    setSearchParams({ id: String(id), search: searchParams.get('search') ?? '' });


    window.scroll({
      top: 0,
      behavior: 'smooth'
    })
  }

  const search = searchParams.get('search') || ''

  const filteredList = list?.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(search)
    )
  );

  return (
    <div className="card">
      <h1>
        List
      </h1>

      <Input
        name='Search'
        value={searchParams.get('search') || ''}
        doesntHaveLabel
        onChange={(e) => {
          setSearchParams({ search: e.target.value, id: String(id) });
        }}
      />
      {!list?.length && 
        <Loading />
      }
      {list?.length  &&
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
      }
    </div >
  )
}