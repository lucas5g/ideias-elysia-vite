import { Card } from "@/components/Card"
import { FieldInput, floatingStyles } from "@/components/FieldInput";
import { Button, Field, FileUpload, Flex, NativeSelect, Spinner } from "@chakra-ui/react"
import { useState } from "react"
import { UploadSimpleIcon } from '@phosphor-icons/react'
import { api } from "@/utils/api";
import { AxiosError } from "axios";
import { mutate } from "swr";
import { Toaster, toaster } from "./ui/toaster";
import type { PhraseInterface } from "@/pages/translate/Index";

const options = [
  'INTERROGATIVE',
  'NEGATIVE',
  'STORY',
  'TRANSLATION',
].sort((a, b) => a.localeCompare(b))

interface Props {
  phrase: PhraseInterface;
  setPhrase: React.Dispatch<React.SetStateAction<PhraseInterface>>
}
export function Form({ phrase, setPhrase }: Readonly<Props>) {
  const uri = '/phrases'
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<File | null>(null)

  // const inputRef = useRef<HTMLInputElement | null>(null);


  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const createPayload = () => {
      if (phrase?.type === 'NEGATIVE' || phrase?.type === 'INTERROGATIVE') {
        const form = new FormData()
        form.append('type', phrase.type)
        form.append('audio', audio as Blob)
        phrase.tags.forEach(tag => form.append('tags', tag))

        return form
      }

      return {
        type: phrase.type,
        portuguese: phrase.portuguese,
        tags: phrase.tags
      }

    }

    const payload = createPayload()
    try {
      setIsLoading(true);
      await api.post(uri, payload);
      mutate(uri);
      toaster.create({
        title: 'Success',
        description: 'Phrase created successfully',
        type: 'success'
      })

    } catch (error) {
      if (error instanceof AxiosError) {

        const property = error.response?.data.property
        const message = error.response?.data.message

        toaster.create({
          title: 'Warning',
          description: property ? `${property.toUpperCase()} - ${message}` : message,
          type: 'warning'
        })

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
                onChange={(e) => setPhrase({ ...phrase, type: e.target.value })}
                value={phrase.type}
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
          {phrase.type === 'TRANSLATION' &&
            <FieldInput
              label="Portuguese"
              name="portuguese"
              onChange={(e) => setPhrase({ ...phrase, portuguese: e.target.value })}
              value={phrase.portuguese}

            />
          }

          {(phrase.type === 'INTERROGATIVE' || phrase.type === 'NEGATIVE') &&

            <FileUpload.Root>
              <FileUpload.HiddenInput
                // ref={inputRef}
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
            onChange={(e) => setPhrase({ ...phrase, tags: [e.target.value] })}
            value={phrase.tags}
          />
          <Flex
            gap={4}
            justifyContent={'flex-end'}
          >
            <Button
              type="submit"
              variant={'surface'}
              disabled={isLoading}
            >
              {isLoading
                ? <Spinner />
                : 'Save'}
            </Button>
            {!!phrase.id &&
              <Button
                background={'red'}
                variant={'outline'}
                onClick={() => {
                  setPhrase({
                    id: 0,
                    portuguese: '',
                    english: '',
                    tags: [],
                    audioUrl: '',
                    type: 'INTERROGATIVE'
                  })
                  api.delete(`/phrases/${phrase.id}`).then(() => {
                    mutate(uri);
                    toaster.create({
                      title: 'Success',
                      description: 'Phrase deleted successfully',
                      type: 'success'
                    })
                  })
                }}
              >
                Delete
              </Button>
            }
          </Flex>
        </Flex>
      </form>
      <Toaster />
    </Card >
  )

}