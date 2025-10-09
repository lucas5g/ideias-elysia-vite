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

  const headers = Object.keys(fields).map(field => field.toLowerCase())


  useEffect(() => {

    if (!id) {
      return
    }

    api.get(`${resource}/${id}`).then(response => {
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

  function isFieldGroup(value: any): value is FieldInterface {
    return typeof value === "object" && value !== null && !("type" in value)
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
          />
        }
      </div>
      {Object.keys(fields).map((field) => {

        if(field === 'row') {
          // console.log(Object.keys(fields[field]))
          const [a, b] = Object.keys(fields[field])
          return (
            <Input key={field} name={field} {...fields[field]} />
          )
          // return (
          //   <div className="row" key={field}>
          //     {Object.keys(field[field]).map((subfield) => {
          //       return <Input key={subfield} name={subfield} {...fields[field][subfield]} />
          //     })}
          //   </div>
          // )
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