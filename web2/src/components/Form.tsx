import type { FieldInterface } from '@/utils/interfaces';
import { Input } from "./Input";
import { useNavigate, useSearchParams } from 'react-router';
import { useEffect } from 'react';
import { api } from '@/utils/api';

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

  function handleReset(){
    headers.forEach((header) => {
      document.getElementById(header)?.setAttribute('value', '')
    })



    navigate(uri)
  }

  return (
    <form className="card">

      <h1>
        Form
      </h1>
      <button>
        delete
      </button>
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
      {id &&
        <button type="button" className="button-delete">
          Delete
        </button>
      }
    </form>
  )
}