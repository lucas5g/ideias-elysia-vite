import React, { useState, type FormEvent, type InputEvent } from 'react';
import { api } from '@/utils/api';
import { mutate } from 'swr';
import { useAppContext } from '@/contexts/AppContext';
import { Button, Card, Flex, Tag } from '@chakra-ui/react';
import { FieldInput } from '@/components/FieldInput';
import TagsInput from '@/components/InputTag';

export function Form() {
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const { uri } = useAppContext();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const portuguese = event.currentTarget.portuguese.value;
    const tag = event.currentTarget.tag.value;

    const payload = {
      portuguese,
      tags: [tag],
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

  function addTag(event: React.KeyboardEvent<HTMLInputElement>) {
    const tag = event.currentTarget.value.trim();

    if (event.key !== 'Enter' && event.key !== ' ') {
      return event
    }

    event.preventDefault();
    const newTags = [...new Set([...tags, tag])];
    setTags(newTags);
    event.currentTarget.value = '';
    return event
  }

  return (
    <Card.Root width={'100%'}>
      <Card.Header>
        <Card.Title>Form</Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          <Flex direction={'column'} gap={4}>
            <FieldInput label="Portuguese" name="portuguese" />
            <Flex direction={'column'} gap={1}>
              <FieldInput label="Tag" name="tag" onKeyDown={addTag} />
              <Flex gap={2}>
                {tags.map((tag) => (
                  <Tag.Root key={tag}>
                    <Tag.Label>{tag}</Tag.Label>
                    <Tag.EndElement>
                      <Tag.CloseTrigger
                        cursor={'pointer'}
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                      />
                      {/* // setTags(tags.filter((_, index) => index !== i)) */}

                    </Tag.EndElement>
                  </Tag.Root>
                ))}
              </Flex>
            </Flex>
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
