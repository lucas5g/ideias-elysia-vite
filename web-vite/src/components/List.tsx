
import type { ItemInterface } from '@/utils/interfaces';
import { useSearchParams } from 'react-router';
import { Loading } from './Loading';
import { Input } from './Input';
import { fetcher } from "@/utils/fetcher";
import { Header } from './Header';


interface Props {
  headers: string[]
  resource: string
  list?: ItemInterface[]
  hideSearch?: boolean
}

export function List({ headers, resource, hideSearch }: Readonly<Props>) {


  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('id')
  const { data: list, isLoading } = fetcher<ItemInterface[]>(resource)

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
    <div className="bg-gray-950 p-5 text-white border border-gray-700 rounded w-full h-fit flex flex-col gap-3">
      <Header text='List' />
      {!hideSearch &&

        <Input
          name='Search'
          value={searchParams.get('search') || ''}
          doesntHaveLabel
          onChange={(e) => {
            if (id) {
              return setSearchParams({ id: String(id), search: e.target.value });
            }
            setSearchParams({ search: e.target.value, action: searchParams.get('action') || 'false'});
          }}
        />
      }
      {isLoading &&
        <Loading />
      }
      {list &&
        <table>
          <thead>
            <tr className='border-b border-gray-600 text-left h-10 '>
              {headers.map((head) => (
                <th className='last:text-right' key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredList?.map((row) => {
              return (
                <tr
                  onClick={() => {
                    if (hideSearch) return;
                    handleSelect(row.id)
                  }}
                  key={row.id}
                  className={'border-b border-gray-700 h-12 hover:bg-gray-700 hover:cursor-pointer hover:transition-all ' + (row.id === Number(id) ? 'bg-gray-600' : '')}
                >
                  {headers.map((head) => (
                    <td className='last:text-right' key={head}>
                      {row[head.toLowerCase()]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      }
    </div >
  )
}