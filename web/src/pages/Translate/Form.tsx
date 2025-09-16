import { useState, type FormEvent } from 'react';
import { api } from '@/utils/api';
import { mutate } from 'swr';
import { useAppContext } from '@/contexts/AppContext';
import { Button, Card, Flex, Input } from '@chakra-ui/react';

export function Form() {
  const [isLoading, setIsLoading] = useState(false);
  const { uri } = useAppContext();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const portuguese = event.currentTarget.portuguese.value;
    const tag = event.currentTarget.tag.value;

    const payload = {
      portuguese,
      tag,
    };

    try {
      setIsLoading(true);
      await api.post('/phrases', payload);
      mutate(uri);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Form</Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <Flex direction={'column'} gap={5}>
            <Input name="portuguese" placeholder="Portuguese" />
            <Input name="tag" placeholder="Tag" />
            <Button
              variant={'surface'}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </Flex>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
// <form onSubmit={handleSubmit}>
{/* <Card>
        <Header title="Form" />

        <Input name="portuguese" placeholder="Portuguese" />
        <Input name="tag" placeholder="Tag" />
        <Button>{isLoading ? 'Saving...' : 'Save'}</Button>
      </Card> */}
