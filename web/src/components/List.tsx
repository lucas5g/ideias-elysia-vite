import { useEffect, useState, type FormEvent } from 'react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { fetcher } from '@/utils/fetcher';
import { Flex, SkeletonText, Table as ChakraTable, InputGroup, Tag, Text } from '@chakra-ui/react';
import { Player } from '@/components/Player';
import { FieldInput } from '@/components/FieldInput';
import { Table } from '@/components/Table';
import { Card } from '@/components/Card';
import type { PhraseInterface } from '@/pages/translate';
import { Error } from '@/components/Error';

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
      setUri(`/phrases?search=${search}`)
      setSearch(search)
    } else {
      setUri('/phrases')
    }

  }, [setUri])

  const { data, error, isLoading } = fetcher<PhraseInterface[]>(uri)

  if (error) {
    return (
      <Error />
    )
  }


  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUri(`/phrases?search=${search}`)
    navigate(`/translate?search=${search}`)

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
        <Table headers={['Phrase', 'Audio']}>
          {data?.map((phrase: PhraseInterface) => {
            return (
              <ChakraTable.Row
                key={phrase.id}
                background={params.id === String(phrase.id) ? 'gray.800' : undefined}

              >
                <ChakraTable.Cell
                  cursor={'pointer'}
                  onClick={() => {
                    scrollTo({
                      behavior: 'smooth',
                      top: 0
                    })
                    navigate(`/translate/phrases/${phrase.id}`)
                  }}
                >
                  <Text marginBottom={1}>
                    {phrase.english}
                  </Text>
                  <Text
                    textStyle={'xs'}
                    fontWeight={'light'}
                  >
                    {phrase.portuguese}
                  </Text>
                  {/* <br /> */}
                  <Flex marginTop={1} gap={2}>
                    {phrase.tags.map((tag) => (
                      <Tag.Root
                        key={tag}
                        size={'sm'}
                      >
                        <Tag.Label>{tag}</Tag.Label>
                      </Tag.Root>
                    ))}
                  </Flex>
                </ChakraTable.Cell>
                <ChakraTable.Cell textAlign={'end'}>
                  <Player audio={phrase.audioUrl} />
                </ChakraTable.Cell>
              </ChakraTable.Row>
            );
          })}
        </Table>
      }
    </Card>
  );
}
