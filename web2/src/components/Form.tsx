import type { FieldInterface } from '@/utils/interfaces';
import { Input } from "./Input";
import { useSearchParams } from 'react-router';
import { useEffect } from 'react';
import { api } from '@/utils/api';
import { TrashIcon } from '@phosphor-icons/react'
import { Select } from '@/components/Select';

interface Props {
  fields: FieldInterface
  resource: string
}
export function Form({ fields, resource }: Readonly<Props>) {
  const [searchParams, setSeachrchParams] = useSearchParams();
  const id = searchParams.get('id')

  const headers = Object.keys(fields).map(field => field)


  useEffect(() => {

    if (!id) {
      return
    }

    api.get(`${resource}/${id}`).then(response => {
      const { data } = response

      headers.forEach((header) => {
        const element = document.getElementById(header.toLowerCase()) as HTMLInputElement
        element.value = data[header.toLowerCase()]
      })

    })

  }, [id])

  function handleReset() {

    headers.forEach((header) => {
      const element = document.getElementById(header.toLowerCase()) as HTMLInputElement
      element.value = ''
    })

    setSeachrchParams({ search: searchParams.get('search') ?? '' })
  }

  async function handleDelete() {
    const confirm = window.confirm('Are you sure?')

    if (!confirm) {
      return
    }
    await api.delete(`${resource}/${id}`)

    headers.forEach((header) => {
      const element = document.getElementById(header.toLowerCase()) as HTMLInputElement
      element.value = ''
    })

    setSeachrchParams({ search: searchParams.get('search') ?? '' })
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


    if (id) {
      await api.patch(`${resource}/${id}`, payload)
      return
    }

    const { data } = await api.post(`${resource}`, payload)
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
        if (fields[field].type === 'select') {
          return <Select key={field} name={field} {...fields[field]} />
        }

        return <Input key={field} name={field} {...fields[field]} />
      })}


      <div className="row">
        <button className="button-primary" type="submit">
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