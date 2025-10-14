import type { FieldInterface } from '@/utils/interfaces';
import { Input } from "./Input";
import { useSearchParams } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { Select } from '@/components/Select';
import { mutate } from 'swr';

interface Props {
  fields: FieldInterface
  resource: string

}
export function Form({ fields, resource }: Readonly<Props>) {

  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoadingButton, setIsLoadingButton] = useState(false)

  const id = searchParams.get('id')
  const action = searchParams.get('action')
  const headers = Object.keys(fields).map(field => field)


  useEffect(() => {

    if (!id) {
      return
    }

    api.get(`${resource}/${id}`).then(({ data }) => {
      headers.forEach((header) => {
        const id = fields[header].id ?? header.toLowerCase()

        const element = document.getElementById(id) as HTMLInputElement

        element.value = data.dados?.[id] || data?.[id] 
      })
    })

  }, [id])

  function cleanFields() {
    headers.forEach((header) => {
      const id = fields[header].id ?? header.toLowerCase()
      const element = document.getElementById(id) as HTMLInputElement
      element.value = ''
    })
  }

  function handleReset() {
    cleanFields()

    setSearchParams({ search: searchParams.get('search') ?? '' })
  }

  async function handleDelete() {
    const confirm = window.confirm('Are you sure?')

    if (!confirm) {
      return
    }
    await api.delete(`${resource}/${id}`)

    cleanFields()

    setSearchParams({ search: searchParams.get('search') ?? '' })
    mutate(resource)
    mutate('/diets/report')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = Object.keys(fields).reduce((acc: Record<string, any>, field) => {
      const key = fields[field].id ?? field.toLowerCase()

      const element = document.getElementById(key) as HTMLInputElement
      const value = element?.value

      acc[key] = fields[field].type === 'number' || key.includes('Id')
        ? Number(value)
        : value
      return acc
    }, {})

    setIsLoadingButton(true)
    if (id) {
      await api.patch(`${resource}/${id}`, payload)

    } else {
      await api.post(`${resource}`, payload)
      cleanFields()
    }
    mutate(resource)
    mutate('/diets/report')
    setIsLoadingButton(false)
  }

  if (!id && !action) {
    return (
      <button
        onClick={() => setSearchParams({ action: 'create' })}
        className='fixed bottom-5 w-10 h-10 right-3  bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-900 border border-gray-200'>
        <PlusIcon size={20} />
      </button>
    )
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
          return <Select
            key={field}
            name={field}
            {...fields[field]} />
        }

        return <Input
          key={field}
          name={field} {...fields[field]} />
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