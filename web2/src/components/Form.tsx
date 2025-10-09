import type { FieldInterface } from '@/utils/interfaces';
import { Input } from "./Input";
import { useNavigate, useSearchParams } from 'react-router';
import { useEffect } from 'react';
import { api } from '@/utils/api';
import { TrashIcon } from '@phosphor-icons/react'

interface Props {
  fields: FieldInterface
  uri: string
}
export function Form({ fields, uri }: Readonly<Props>) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id')

  const headers = Object.keys(fields).map(field => field.toLowerCase())


  useEffect(() => {

    if (!id) {
      return
    }

    api.get(`${uri}/${id}`).then(response => {
      const { data } = response

      headers.forEach((header) => {
        document.getElementById(header)?.setAttribute('value', data[header])
      })
    })

  }, [id])

  function handleReset() {
    headers.forEach((header) => {
      document.getElementById(header)?.setAttribute('value', '')
    })

    navigate(uri)
  }

  async function handleDelete() {
    const confirm = window.confirm('Are you sure?')

    if (!confirm) {
      return
    }
    await api.delete(`${uri}/${id}`)
    handleReset()
  }

  return (
    <form className="card">
      <div className='row justify-between border-b border-gray-600'>
        <h2>
          Form
        </h2>
        {id &&
          <TrashIcon 
            size={20} 
            className='cursor-pointer rounded-full hover:bg-red-500' 
            onClick={handleDelete} 
            // color='white'
            />
          // <button
          //   type='button'
          //   className='bg-red-500 hover:bg-red-600 hover:border hover:border-red-700 w-8 h-8 rounded-full flex items-center justify-center'>
          // </button>
        }
      </div>
      {Object.keys(fields).map((field) => (
        <Input key={field} name={field} {...fields[field]} />
      ))}

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