import type { FieldInterface } from '@/utils/interfaces';
import { Input } from "./Input";
import { useSearchParams } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { TrashIcon } from '@phosphor-icons/react'
import { Select } from '@/components/Select';
import { mutate } from 'swr';

interface Props {
  fields: FieldInterface
  resource: string
}
export function Form({ fields, resource }: Readonly<Props>) {

  const [searchParams, setSeachrchParams] = useSearchParams();
  const [isLoadingButton, setIsLoadingButton] = useState(false)

  const id = searchParams.get('id')
  const headers = Object.keys(fields).map(field => field)


  useEffect(() => {

    if (!id) {
      return
    }

    api.get(`${resource}/${id}`).then(({ data }) => {
      headers.forEach((header) => {
        const element = document.getElementById(header.toLowerCase()) as HTMLInputElement
        element.value = data?.[header.toLowerCase() as keyof typeof data] || ''
      })
    })

  }, [id])

  function cleanFields() {
    headers.forEach((header) => {   
      const element = document.getElementById(header.toLowerCase()) as HTMLInputElement
      element.value = ''
    })
  }

  function handleReset() {
    cleanFields()

    setSeachrchParams({ search: searchParams.get('search') ?? '' })
  }

  async function handleDelete() {
    const confirm = window.confirm('Are you sure?')

    if (!confirm) {
      return
    }
    await api.delete(`${resource}/${id}`)

    cleanFields()

    setSeachrchParams({ search: searchParams.get('search') ?? '' })
    mutate(resource)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = Object.keys(fields).reduce((acc: Record<string, any>, field) => {
      const element = document.getElementById(field.toLowerCase()) as HTMLInputElement
      const value = element.value

      const key = field.toLowerCase()

      acc[key] = fields[field].type === 'number'
        ? Number(value)
        : value
      return acc
    }, {})

    const request = id
      ? api.patch(`${resource}/${id}`, payload)
      : api.post(`${resource}`, payload)

    setIsLoadingButton(true)
    const { data } = await request
    setIsLoadingButton(false)

    mutate(resource)
    setSeachrchParams({ id: String(data.id), search: searchParams.get('search') ?? data['name'] })
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className='row justify-between border-b border-gray-600'>
        <h2>
          Form
        </h2>
        {id &&
          <TrashIcon
            size={20}
            className='cursor-pointer rounded-full hover:bg-red-500'
            onClick={handleDelete}
          />
        }
      </div>
      {headers.map((field) => {

        if (fields[field].type === 'hidden') {
          return
        }

        if (fields[field].type === 'select') {
          return <Select key={field} name={field} {...fields[field]} />
        }

        return <Input key={field} name={field} {...fields[field]} />
      })}


      <div className="row">
        <button
          className="button-primary"
          type="submit"
          disabled={isLoadingButton}
        >
          {id ? 'Update' : 'Create'}
        </button>
        <button
          className="button-secondary"
          type="reset"
          onClick={handleReset}
        >
          Cancel
        </button>
      </div>

    </form>
  )
}