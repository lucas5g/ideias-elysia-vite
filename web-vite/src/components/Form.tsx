import type { FieldInterface } from '@/utils/interfaces';
import { Input } from "./Input";
import { useSearchParams } from 'react-router';
import {  useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { Select } from '@/components/Select';
import { mutate } from 'swr';
import { Header } from './Header';
import { Button } from './Button';

interface Props {
  fields: FieldInterface
  resource: string

}
export function Form({ fields, resource }: Readonly<Props>) {

  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoadingButton, setIsLoadingButton] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const id = searchParams.get('id')
  const action = searchParams.get('action')

  const headers = Object.keys(fields).map(field => field)


  useEffect(() => {

    if (!id) {
      return
    }

    api.get(`${resource}/${id}`).then(({ data }) => {
      for (const header of headers) {
        const id = fields[header].id ?? header.toLowerCase();

        const element = document.getElementById(id) as HTMLInputElement;

        element.value = data.dados?.[id] || data?.[id];
      }
    })

  }, [id])

  useEffect(() => {
    if (id || action === 'create') {
      return setShowForm(true)
    }
    setShowForm(false)
  }, [id, action])

  function cleanFields() {
    for (const header of headers) {
      const id = fields[header].id ?? header.toLowerCase();
      const element = document.getElementById(id) as HTMLInputElement;
      element.value = '';
    }
  }

  function handleReset() {
    cleanFields()

    setSearchParams({ search: searchParams.get('search') ?? '' })
  }

  async function handleDelete() {
    const confirm = globalThis.confirm('Are you sure?')

    if (!confirm) {
      return
    }
    await api.delete(`${resource}/${id}`)

    cleanFields()

    setSearchParams({ search: searchParams.get('search') ?? '' })
    mutate(resource)
    // mutate('/diets/report')
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
    setIsLoadingButton(false)
  }


  return (
    <>
      {!showForm &&
        <button
          onClick={() => setSearchParams({ action: 'create', search: searchParams.get('search') ?? '' })}
          className='fixed bottom-5 w-10 h-10 right-3  bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-900 border border-gray-200 cursor-pointer'>
          <PlusIcon size={20} />
        </button>
      }
      {showForm &&

        <form className='bg-gray-950 p-5 text-white border border-gray-700 rounded w-full h-fit flex flex-col gap-3' onSubmit={handleSubmit}>
          <div className='flex justify-between border-b border-gray-600'>
            <Header text='Form' />
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


          <div className="space-y-3">
            <Button
              className="button-primary"
              type="submit"
              disabled={isLoadingButton}
            >
              {id ? 'Update' : 'Create'}
            </Button>
            <Button 
              type="reset"
              onClick={handleReset}
            >
              Cancel
            </Button>
          </div>
        </form>
      }
    </>
  )
}