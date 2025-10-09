import type { FieldInterface } from '@/utils/interfaces';
import { Input } from "./Input";
import { useParams } from 'react-router';
import { useEffect } from 'react';
import { api } from '@/utils/api';

interface Props {
  fields: FieldInterface
}
export function Form({ fields }: Readonly<Props>) {
  const { id } = useParams();
  const headers = Object.keys(fields).map(field => field.toLowerCase())


  useEffect(() => {
    if (!id) {
      return
    }

    api.get(`/foods/${id}`).then(response => {
      const { data } = response
      console.log('headers ', headers)
      console.log('data ', data)

      headers.forEach((header) => {
        document.getElementById(header)?.setAttribute('value', data[header])
      })
    })
    
  }, [id])


  return (
    <form className="card">

      <h1>
        Form
      </h1>
      {Object.keys(fields).map((field) => (
        <Input key={field} name={field} {...fields[field]} />
      ))}

      <button className="button-primary" type="submit">
        Save
      </button>
      <button className="button-secondary" type="reset">
        Cancel
      </button>
      <button type="button" className="button-delete">
        Delete
      </button>
    </form>
  )
}