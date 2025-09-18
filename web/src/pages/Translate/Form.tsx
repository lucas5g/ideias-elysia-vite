import { useState, type FormEvent } from 'react';
import { api } from '@/utils/api';
import { mutate } from 'swr';
import { useAppContext } from '@/contexts/AppContext';
import { Button, Card, Flex } from '@chakra-ui/react';
import { FieldInput } from '@/components/FieldInput';

export function Form() {
  const [isLoading, setIsLoading] = useState(false);
  const { uri } = useAppContext();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const portuguese = event.currentTarget.portuguese.value;
    const tag = event.currentTarget.tag.value;

    const payload = {
      portuguese,
      tags:[tag],
    };

    try {
      setIsLoading(true);
      await api.post('/phrases', payload);
      mutate(uri);
      event.currentTarget.reset();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);

    }
  }

  return (
    <Card.Root width={'100%'}>
      <Card.Header>
        <Card.Title>Form</Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <Flex direction={'column'} gap={5}>
            <FieldInput label="Portuguese" name="portuguese" />
            <FieldInput label="Tag" name="tag" />
     
            <Button
              type="submit"
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
