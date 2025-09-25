import { useEffect, useState, type FormEvent } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react';
import { useSearchParams } from 'react-router';
import { fetcher } from '@/utils/fetcher';
import { Flex, SkeletonText, Table as ChakraTable, InputGroup, Tag, IconButton, Text } from '@chakra-ui/react';
import { Player } from '@/components/Player';
import { FieldInput } from '@/components/FieldInput';
import { Table } from '@/components/Table';
import { Card } from '@/components/Card';
import type { PhraseInterface } from '@/pages/translate/Index';

interface Props {
  uri: string
  setUri: React.Dispatch<React.SetStateAction<string>>
}
export function List({ uri, setUri }: Readonly<Props>) {
  const [search, setSearch] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const search = searchParams.get('search')

    if (search) {
      setUri(`/phrases?search=${search}`)
      setSearch(search)
    } else {
      setUri('/phrases')
    }

  }, [searchParams, setUri])

  const { data, error, isLoading } = fetcher<PhraseInterface[]>(uri)

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
          {data?.map((phrase: PhraseInterface) => {
            return (
              <ChakraTable.Row
                key={phrase.id}
              // onClick={} 
              >
                <ChakraTable.Cell >
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
      <Flex

        position={'fixed'}
        bottom={5}
        right={5}

      >
        <IconButton
          rounded={'full'}
          variant={'surface'}
        >
          <PlusIcon />
        </IconButton>

      </Flex>
    </Card>
  );
}
