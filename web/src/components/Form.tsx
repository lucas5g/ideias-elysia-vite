import { Card } from "@/components/Card"
import { FieldInput, floatingStyles } from "@/components/FieldInput";
import { Button, Field, FileUpload, Flex, NativeSelect, Spinner } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
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
  phrase: PhraseInterface
  setPhrase: React.Dispatch<React.SetStateAction<PhraseInterface>>
  uri: string
}
export function Form({ phrase, setPhrase, uri }: Readonly<Props>) {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<PhraseInterface['type']>('TRANSLATION')
  const [audio, setAudio] = useState<File | null>(null)
  const phraseRef = useRef<PhraseInterface>({
    portuguese: '',
    audioUrl: '',
    english: '',
    id: 0,
    tags: [],
    type: 'INTERROGATIVE'
  })

  useEffect(() => {
    phraseRef.current = phrase
    setType(phrase.type)
  }, [phrase.id])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { portuguese, tags } = phraseRef.current

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

  // console.log('phraseRef => ', phraseRef.current.portuguese)
  // console.log('phrase => ', phrase.portuguese)
  return (

    <Card
      key={phrase.id}
      title='Form'>
      <form onSubmit={handleSubmit}>
        <Flex direction={'column'} gap={4}>
          <Field.Root>


            <NativeSelect.Root>
              <NativeSelect.Field
                name="type"
                // onChange={(e) => phraseRef.current.type = e.target.value as PhraseInterface['type']}
                onChange={(e) => setType(e.target.value as PhraseInterface['type'])}
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
              // key={phrase.id}
              label="Portuguese"
              name="portuguese"
              onChange={(e) => phraseRef.current.portuguese = e.target.value}
              // value={phraseRef.current.portuguese || phrase.portuguese}
              // defaultValue={phrase.portuguese}
              defaultValue={phraseRef.current.portuguese}

            />
          }

          {(type === 'INTERROGATIVE' || type === 'NEGATIVE') &&

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
            key={phrase.id}
            name="tag"
            label="Tag"
            onChange={(e) => phraseRef.current.tags = e.target.value.split(/[,\s]/g).filter(Boolean)}
            value={phrase.tags.join(', ')}
          // defaultValue={phraseRef.current.tags.join(', ')}
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