import { useState, type FormEvent } from 'react';
import { api } from '@/utils/api';
import { mutate } from 'swr';
import { useAppContext } from '@/contexts/AppContext';
import { Button, Card, Flex, Spinner } from '@chakra-ui/react';
import { FieldInput } from '@/components/FieldInput';
import { TagsInput } from '@/components/TagsInput';

export function Form() {
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [portuguese, setPortuguese] = useState<string>('');
  const { uri } = useAppContext();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      portuguese,
      tags,
    };

    try {
      setIsLoading(true);
      await api.post('/phrases', payload);
      mutate(uri);
      setPortuguese('');
      setTags([]);
      console.log({ tags })
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
          <Flex direction={'column'} gap={4}>
            <FieldInput
              label="Portuguese"
              name="portuguese"
              onChange={(event) => setPortuguese(event.target.value)}
              value={portuguese}
            />
            <TagsInput tags={tags} setTags={setTags} />

            <Button
              type="submit"
              variant={'surface'}
              disabled={isLoading}
            >
              {isLoading
                ? <Spinner />
                : 'Save'}
            </Button>
          </Flex>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
