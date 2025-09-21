import { useEffect, useState, type FormEvent } from 'react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useSearchParams } from 'react-router';
import { useAppContext } from '@/contexts/AppContext';
import { fetcher } from '@/utils/fetcher';
import { Flex, SkeletonText, Table as ChakraTable, InputGroup } from '@chakra-ui/react';
import { Player } from '@/components/Player';
import { FieldInput } from '@/components/FieldInput';
import { Table } from '@/components/Table';
import { Card } from '@/components/Card';
interface Phrase {
  id: number;
  portuguese: string;
  english: string;
  tags: string[];
  audio: string;
}
export function List() {
  const [search, setSearch] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams()
  const { uri, setUri } = useAppContext();

  useEffect(() => {
    const search = searchParams.get('search')

    if (search) {
      setUri(`/phrases?search=${search}`)
      setSearch(search)
    } else {
      setUri('/phrases')
    }

  }, [])

  const { data, error, isLoading } = fetcher<Phrase[]>(uri)

  if (error) return <div>failed to load</div>

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchParams({ search })
    setUri(`/phrases?search=${search}`)
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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </InputGroup>
        </Flex>
      </form>

      {isLoading &&
        <SkeletonText noOfLines={3} gap="4" />
      }
      {!isLoading &&
        <Table headers={['Phrase', 'Audio']}>
          {data?.map((phrase: Phrase) => {
            return (
              <ChakraTable.Row key={phrase.id}>
                <ChakraTable.Cell>
                  {phrase.portuguese} <br />
                  {phrase.english}
                </ChakraTable.Cell>
                <ChakraTable.Cell textAlign={'end'}>
                  <Player audio={phrase.audio} />
                </ChakraTable.Cell>
              </ChakraTable.Row>
            );
          })}
        </Table>
      }
    </Card>
  );
}
