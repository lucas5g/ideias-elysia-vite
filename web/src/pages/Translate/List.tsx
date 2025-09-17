import { useEffect, useState, type FormEvent } from 'react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useSearchParams } from 'react-router';
import { useAppContext } from '@/contexts/AppContext';
import { fetcher } from '@/utils/fetcher';
import { Button, Card, Flex, SkeletonText, Table } from '@chakra-ui/react';
import { Player } from '@/components/Player';
import { FieldInput } from '@/components/FieldInput';
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

    <Card.Root width={'100%'}>
      <Card.Header>
        <Card.Title>
          List
        </Card.Title>
      </Card.Header>
      <Card.Body gap={3}>
        <form onSubmit={handleSearch}>
          <Flex gap={3}>
            <FieldInput
              // label={'Search'} 
              name="search"
              placeholder="Search portuguese, english or tags"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {/* <Input
              name="search"
              placeholder="Search portuguese, english or tags"
              value={search}
              onChange={(event) => setSearch(event.target.value)}

            /> */}
            <Button variant={'surface'}>
              <MagnifyingGlassIcon size={23} />
            </Button>
          </Flex>
        </form>

        {isLoading &&
          <SkeletonText noOfLines={3} gap="4" />
        }
        {!isLoading &&
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Phrase</Table.ColumnHeader>
                <Table.ColumnHeader textAlign={'end'}>
                  Audio
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data?.map((phrase: Phrase) => {
                return (
                  <Table.Row key={phrase.id}>
                    <Table.Cell>
                      {phrase.portuguese} <br />
                      {phrase.english}
                    </Table.Cell>
                    <Table.Cell textAlign={'end'}>
                      <Player audio={phrase.audio} />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        }
      </Card.Body>
    </Card.Root>
  );
}
