import type { FieldInterface } from '@/utils/interfaces';
import { Input } from "./Input";
import { useNavigate, useParams } from 'react-router';
import { useEffect } from 'react';
import { api } from '@/utils/api';

interface Props {
  fields: FieldInterface
}
export function Form({ fields }: Readonly<Props>) {
  const { id } = useParams();
  const navigate = useNavigate();

  const headers = Object.keys(fields).map(field => field.toLowerCase())


  useEffect(() => {
    if (!id) {
      return
    }

    api.get(`/foods/${id}`).then(response => {
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

    navigate('/foods')
  }




  return (
    <form className="card">

      <h1>
        Form
      </h1>
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