import { useState, type FormEvent } from 'react';
import { api } from '@/utils/api';
import { mutate } from 'swr';
import { useAppContext } from '@/contexts/AppContext';
import { Button, Flex, Spinner } from '@chakra-ui/react';
import { FieldInput } from '@/components/FieldInput';
import { TagsInput } from '@/components/TagsInput';
import { AxiosError } from 'axios';
import { delay } from '@/utils/delay';
import { Card } from '@/components/Card';

export function Form() {
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tag, setTag] = useState<string>('');
  const [tagError, setTagError] = useState<string>('');
  const [portuguese, setPortuguese] = useState<string>('');
  const { uri } = useAppContext();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      portuguese,
      tags: [...new Set([...tags, tag])]
    };

    try {
      setIsLoading(true);
      await api.post('/phrases', payload);
      mutate(uri);
      setPortuguese('');
      setTags([]);

    } catch (error) {
      if (error instanceof AxiosError) {
        setTagError(error.response?.data.message || error.message);
      }
    } finally {
      setIsLoading(false);
      await delay(5000);
      setTagError('');
    }
  }


  return (
    <Card title="Form">
      <form onSubmit={handleSubmit}>
        <Flex direction={'column'} gap={4}>
          <FieldInput
            label="Portuguese"
            name="portuguese"
            onChange={(event) => setPortuguese(event.target.value)}
            value={portuguese}
          />
          <TagsInput
            tags={tags}
            setTags={setTags}
            tag={tag}
            setTag={setTag}
            error={tagError}
          />

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
    </Card>
  );
}
