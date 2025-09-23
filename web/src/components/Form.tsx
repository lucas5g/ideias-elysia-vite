import { Card } from "@/components/Card"
import { FieldInput, floatingStyles } from "@/components/FieldInput";
import { Button, Field, FileUpload, Flex, NativeSelect, Spinner } from "@chakra-ui/react"
import { useRef, useState } from "react"
import { UploadSimpleIcon } from '@phosphor-icons/react'
import { api } from "@/utils/api";
import { AxiosError } from "axios";
import { useAppContext } from "@/contexts/AppContext";
import { mutate } from "swr";

const options = [
  'INTERROGATIVE',
  'NEGATIVE',
  'STORY',
  'TRANSLATION',
].sort((a, b) => a.localeCompare(b))


export function Form() {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<string>(options[3]);
  const [audio, setAudio] = useState<File | null>(null);
  const [portuguese, setPortuguese] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const { uri } = useAppContext();
  const inputRef = useRef<HTMLInputElement | null>(null);


  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData()

    form.append('type', type)

    if (type !== 'TRANSLATION') {
      form.append('audio', audio as Blob)
    }
    if (type === 'TRANSLATION') {
      form.append('portuguese', portuguese)
    }

    form.append('tags', tag)
    form.append('tags', tag)

    try {
      setIsLoading(true);
      await api.post('/phrases', form);
      mutate(uri);
      setPortuguese('');
      setTag('');
      setAudio(null);
      setType(options[0])
    } catch (error) {
      if (error instanceof AxiosError) {

        const property = error.response?.data.property
        const message = error.response?.data.message
        alert(`${property ? property.toUpperCase() + ' -' : ''}  ${message}`)
        return
      }
      console.error(error);
    } finally {
      setIsLoading(false);

    }

  }

  return (

    <Card title='Form'>
      <form onSubmit={handleSubmit}>
        <Flex direction={'column'} gap={4}>
          <Field.Root>


            <NativeSelect.Root>
              <NativeSelect.Field
                onChange={(e) => setType(e.target.value)}
                value={type}
              >
                {options.map((option) => (
                  <option key={option} value={option}>{option.toLowerCase()}</option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
            <Field.Label css={floatingStyles}>
              Type
            </Field.Label>
          </Field.Root>
          {type === 'TRANSLATION' &&
            <FieldInput
              label="Portuguese"
              name="portuguese"
              onChange={(e) => setPortuguese(e.target.value)}
              value={portuguese}

            />
          }

          {type !== 'TRANSLATION' &&

            <FileUpload.Root>
              <FileUpload.HiddenInput
                ref={inputRef}
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
              {/* <FileUpload.ItemDeleteTrigger /> */}
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