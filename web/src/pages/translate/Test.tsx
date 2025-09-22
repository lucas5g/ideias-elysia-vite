import { Card } from "@/components/Card"
import { FieldInput, floatingStyles } from "@/components/FieldInput";
import { Button, Field, FileUpload, Flex, NativeSelect, Spinner } from "@chakra-ui/react"
import { useState } from "react"
import { UploadSimpleIcon } from '@phosphor-icons/react'
import { api } from "@/utils/api";

const options = [
  'Translation',
  'Negative',
  'Interrogative'
]


export function TranslateTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<string>(options[0].toLowerCase());
  const [audio, setAudio] = useState<File | null>(null);
  const [portuguese, setPortuguese] = useState<string>('');
  const [tag, setTag] = useState<string>('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      type,
      portuguese: type === 'translation' ? portuguese : undefined,
      audio: type !== 'translation' ? audio : undefined,
      tags: [tag]
    };

    try {
      setIsLoading(true);
      await api.post('/phrases', payload);
      //  mutate(uri);
      setPortuguese('');
      setTag('');
      setAudio(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }

    console.log({ type })
    console.log({ portuguese })
    console.log({ audio })
    console.log({ tag })

  }

  return (

    <Card title='Form'>
      <form onSubmit={handleSubmit}>
        <Flex direction={'column'} gap={4}>
          <Field.Root>


            <NativeSelect.Root>
              <NativeSelect.Field
                onChange={(e) => setType(e.target.value)}
              >
                {options.map((option) => (
                  <option key={option} value={option.toLowerCase()}>{option}</option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
            <Field.Label css={floatingStyles}>
              Type
            </Field.Label>
          </Field.Root>
          {type === 'translation' &&
            <FieldInput
              label="Portuguese"
              name="portuguese"

            />
          }

          {type !== 'translation' &&

            <FileUpload.Root>
              <FileUpload.HiddenInput
                accept=".mp3, .ogg"
                onChange={event => setAudio((event.target as HTMLInputElement).files?.[0] || null)}

              />
              <FileUpload.Trigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  width={'full'}
                >
                  <UploadSimpleIcon /> Select Audio
                </Button>
              </FileUpload.Trigger>
              <FileUpload.List />
            </FileUpload.Root>

          }

          < FieldInput
            name="tag"
            label="Tag"
            onChange={(e) => setTag(e.target.value)}
            value={tag}
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
    </Card >
  )

}