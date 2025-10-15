import { useEffect, useState, type FormEvent } from 'react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { fetcher } from '@/utils/fetcher';
import { Flex, SkeletonText, Table as ChakraTable, InputGroup} from '@chakra-ui/react';
import { FieldInput } from '@/components/FieldInput';
import { Table } from '@/components/Table';
import { Card } from '@/components/Card';
import { Error } from '@/components/Error';
import type { FoodInterface } from '@/pages/diet/food';

interface Props {
  uri: string
  setUri: React.Dispatch<React.SetStateAction<string>>
}
export function List({ uri, setUri }: Readonly<Props>) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState<string>('')
  const params = useParams()


  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setUri(`/foods?search=${search}`)
      setSearch(search)
    } else {
      setUri('/foods')
    }

  }, [setUri])

  const { data, error, isLoading } = fetcher<[]>(uri)

  if (error) {
    return (
      <Error />
    )
  }


  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUri(`/foods?search=${search}`)
    navigate(`/diet/foods?search=${search}`)
  }


  return (
    <Card title='List'>

      <form onSubmit={handleSearch}>
        <Flex gap={3}>
          <InputGroup
            endElement={
              <button type='submit'>
                <MagnifyingGlassIcon
                  type='submit'
                  cursor={'pointer'}
                />
              </button>
            }>
            <FieldInput
              name="search"
              label='Search'
              onChange={(e) => setSearch(e.target.value)}
              value={search}

            />
          </InputGroup>
        </Flex>
      </form>

      {isLoading &&
        <SkeletonText noOfLines={3} gap="4" />
      }
      {!isLoading &&
        <Table headers={['Name', 'Protein', 'Fat', 'Carbo', 'Fiber', 'Calorie']}>
          {data?.map((row: FoodInterface) => {
            return (
              <ChakraTable.Row
                key={row.id}
                background={params.id === String(row.id) ? 'gray.800' : undefined}

              >
                <ChakraTable.Cell
                  cursor={'pointer'}
                  onClick={() => {
                    scrollTo({
                      behavior: 'smooth',
                      top: 0
                    })
                    navigate(`/diet/foods/${row.id}`)
                  }}
                >
                  {row.name}
                </ChakraTable.Cell>                
                <ChakraTable.Cell>{row.protein}</ChakraTable.Cell>
                <ChakraTable.Cell>{row.fat}</ChakraTable.Cell>
                <ChakraTable.Cell>{row.carbo}</ChakraTable.Cell>
                <ChakraTable.Cell>{row.fiber}</ChakraTable.Cell>
                <ChakraTable.Cell>{row.calorie}</ChakraTable.Cell>  
              </ChakraTable.Row>
            );
          })}
        </Table>
      }
    </Card>
  );
}
