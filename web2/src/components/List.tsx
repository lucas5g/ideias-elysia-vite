
import type {  ItemInterface } from '@/utils/interfaces';
import { useSearchParams } from 'react-router';
import { Loading } from './Loading';
import { Input } from './Input';
import { fetcher } from "@/utils/fetcher";


interface Props {
  headers: string[]
  resource: string
  list?: ItemInterface[]
  isLoading?: boolean
}

export function List({ headers, resource, list, isLoading }: Readonly<Props>) {


  const [searchParams, setSearchParams] = useSearchParams();  
  const id = searchParams.get('id')

  const search = searchParams.get('search') || ''
  const filteredList = list?.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(search)
    )
  );


  function handleSelect(id: number) {

    setSearchParams({ id: String(id), search: searchParams.get('search') ?? '' });

    window.scroll({
      top: 0,
      behavior: 'smooth'
    })
  }
  
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
          if (id) {
            return setSearchParams({ id: String(id), search: e.target.value });
          }
          setSearchParams({ search: e.target.value });
        }}
      />
      {isLoading &&
        <Loading />
      }
      {list &&
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