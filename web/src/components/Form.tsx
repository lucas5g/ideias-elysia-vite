import { Card } from "@/components/Card"
import { FieldInput } from "@/components/FieldInput";
import { Button, Flex, IconButton, Spinner } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { TrashIcon } from '@phosphor-icons/react'
import { api } from "@/utils/api";
import { AxiosError } from "axios";
import { mutate } from "swr";
import { Toaster, toaster } from "./ui/toaster";
import type { PhraseInterface } from "@/pages/translate";
import { useNavigate, useParams } from "react-router";
import { SelectInput } from "@/components/SelectInput";
import { FileUploadInput } from "@/components/FileUploadInput";

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

    const { portuguese, tags, type, english } = phrase

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

    if (phrase.id) {
      form.append('english', english)
    }


    try {
      setIsLoading(true);
      const request = phrase.id
        ? api.patch(`/phrases/${phrase.id}`, form)
        : api.post(uri, form);

      await request;

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

  function labelButton() {
    if (isLoading) {
      return <Spinner />
    }
    if (phrase.id) {
      return 'Update'
    }
    return 'Save'
  }

  return (

    <Card
      title={`Form ${phrase.id ? `#${phrase.id}` : 'New Phrase'}`}>
      <form onSubmit={handleSubmit}>

        <Flex direction={'column'} gap={4}>
          <SelectInput
            onChange={e => setPhrase({ ...phrase, type: e.target.value as PhraseInterface['type'] })}
            value={phrase.type}
          />

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
              value={phrase.english}
            />
          }

          {(phrase.type === 'INTERROGATIVE' || phrase.type === 'NEGATIVE') &&

            <FileUploadInput
              onChange={e => setAudio(e.target.files?.[0] ?? null)}
            />

          }

          <FieldInput
            name="tags"
            label="Tags"
            onChange={e =>
              setPhrase({ ...phrase, tags: e.target.value.split(/\s/g) })}
            value={phrase.tags.join(' ')}
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
              {labelButton()}
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
                  const confirm = window.confirm('Are you sure you want to delete this phrase?')
                  if (!confirm) return
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
          </Flex>
        </Flex>
      </form>
      <Toaster />
    </Card >
  )

}