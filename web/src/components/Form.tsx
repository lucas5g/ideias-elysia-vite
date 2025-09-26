import { Card } from "@/components/Card"
import { FieldInput, floatingStyles } from "@/components/FieldInput";
import { Button, Field, FileUpload, Flex, IconButton, NativeSelect, Spinner } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react'
import { api } from "@/utils/api";
import { AxiosError } from "axios";
import { mutate } from "swr";
import { Toaster, toaster } from "./ui/toaster";
import type { PhraseInterface } from "@/pages/translate/Index";
import { useNavigate, useParams } from "react-router";

const options = [
  'INTERROGATIVE',
  'NEGATIVE',
  'STORY',
  'TRANSLATION',
].sort((a, b) => a.localeCompare(b))

interface Props {
  uri: string
}
export function Form({ uri }: Readonly<Props>) {
  const [phrase, setPhrase] = useState<PhraseInterface>({
    id: 0,
    portuguese: '',
    english: '',
    tags: [],
    audioUrl: '',
    type: 'TRANSLATION'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<File | null>(null)
  const params = useParams()
  const navigate = useNavigate()


  useEffect(() => {
    if (!params.id) {
      return
    }
    api.get<PhraseInterface>(`/phrases/${params.id}`)
      .then(({ data }) => setPhrase(data))


  }, [params])



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { portuguese, tags, type } = phrase

    const form = new FormData()
    form.append('type', type)
    tags.forEach(tag => form.append('tags', tag))

    if (type === 'INTERROGATIVE' || type === 'NEGATIVE') {
      form.append('audio', audio as Blob)
    }

    if (tags.length === 1) {
      form.append('tags', tags[0])
    }

    if (type === 'TRANSLATION') {
      form.append('portuguese', portuguese)
    }


    try {
      setIsLoading(true);
      await api.post(uri, form);

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

    <Card
      title='Form'>
      <form onSubmit={handleSubmit}>

        <Flex direction={'column'} gap={4}>
          <Field.Root>

            <NativeSelect.Root>
              <NativeSelect.Field
                name="type"
                id="type"
                onChange={e => setPhrase({ ...phrase, type: e.target.value as PhraseInterface['type'] })}
                value={phrase?.type}
              >
                {options.map((option) => (
                  <option key={option} value={option}>{option.toLowerCase()}</option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
            <Field.Label css={floatingStyles} htmlFor="type">
              Type
            </Field.Label>
          </Field.Root>
          {phrase.type === 'TRANSLATION' &&
            <FieldInput
              label="Portuguese"
              name="portuguese"
              onChange={e => setPhrase({ ...phrase, portuguese: e.target.value })}
              value={phrase.portuguese}
            />
          }

          {!!phrase.id &&
            <FieldInput
              label="English"
              name="english"
              disabled
              value={phrase.english}
            />
          }

          {(phrase.type === 'INTERROGATIVE' || phrase.type === 'NEGATIVE') &&

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

          <FieldInput
            name="tags"
            label="Tag"
            onChange={e => setPhrase({ ...phrase, tags: e.target.value.split(/[,\s]/g).filter(Boolean) as string[] })}
            value={phrase.tags.join(', ')}
          />
          <Flex
            gap={3}
            justifyContent={'flex-end'}
          >
            <Button
              type="submit"
              variant={'surface'}
              disabled={isLoading}
              min-width={'7em'}
            >
              {isLoading
                ? <Spinner />
                : 'Save'}
            </Button>
            <Button
              min-width={'7em'}
              variant={'outline'}
              onClick={() => {

                setPhrase({
                  id: 0,
                  portuguese: '',
                  english: '',
                  tags: [],
                  audioUrl: '',
                  type: 'TRANSLATION'
                })
                navigate('/translate')
              }}

            >
              Clear
            </Button>
            {!!phrase.id &&
              <IconButton
                bg={'red'} color={'white'} _hover={{ bg: 'red.400' }}
                onClick={() => {
                  setPhrase({
                    id: 0,
                    portuguese: '',
                    english: '',
                    tags: [],
                    audioUrl: '',
                    type: 'TRANSLATION'
                  })
                  navigate('/translate')
                  api
                    .delete(`/phrases/${phrase.id}`)
                    .then(() => {
                      mutate(uri);
                      toaster.create({
                        title: 'Success',
                        description: 'Phrase deleted successfully',
                        type: 'success'
                      })
                    })
                }}
              >
                <TrashIcon />
              </IconButton>
            }
            {/* {!!phrase.id &&
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
            } */}
          </Flex>
        </Flex>
      </form>
      <Toaster />
    </Card >
  )

}