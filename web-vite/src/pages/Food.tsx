import { Form } from '@/components/Form'
import { List } from '@/components/List'
import type { FieldInterface } from '@/utils/interfaces'

export function Food() {
  const fields: FieldInterface = {
    Name: {
      type: 'text',
    },
    Protein: {
      type: 'number',
    },
    Fat: {
      type: 'number',
    },
    Carbo: {
      type: 'number',
    },
    Fiber: {
      type: 'number',
    },
    Calorie: {
      type: 'number',
    },

  }

  const resource = '/foods'

  return (
    <>
      <Form
        fields={fields}
        resource={resource} />
      <List
        headers={Object.keys(fields)}
        resource={resource}
      />
    </>
  )
}