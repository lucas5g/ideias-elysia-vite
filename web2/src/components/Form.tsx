import type { FieldInterface } from '@/utils/interfaces';
import { Input } from "./Input";
import { useNavigate, useSearchParams } from 'react-router';
import { useEffect } from 'react';
import { api } from '@/utils/api';
import { TrashIcon } from '@phosphor-icons/react'

interface Props {
  fields: FieldInterface
  resource: string
}
export function Form({ fields, resource }: Readonly<Props>) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id')

  const headers = Object.keys(fields).map(field => field)


  useEffect(() => {

    if (!id) {
      return
    }

    api.get(`${resource}/${id}`).then(response => {
      const { data } = response

      headers.forEach((header) => {
        document.getElementById(header.toLowerCase())?.setAttribute('value', data[header.toLowerCase()])
      })

    })

  }, [id])

  function handleReset() {

    headers.forEach((header) => {
      document.getElementById(header.toLowerCase())?.setAttribute('value', '')
    })

    navigate(resource)
  }

  async function handleDelete() {
    const confirm = window.confirm('Are you sure?')

    if (!confirm) {
      return
    }
    await api.delete(`${resource}/${id}`)
    handleReset()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = Object.keys(fields).reduce((acc: Record<string, any>, field) => {
      const value = document.getElementById(field.toLowerCase())?.getAttribute('value')
      const key = field.toLowerCase()

      acc[key] = fields[field].type === 'number'
        ? Number(value)
        : value
      return acc
    }, {})

console.log(data)
    if (id) {
      await api.patch(`${resource}/${id}`, data)
      return
    }

    await api.post(`${resource}`, data)
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