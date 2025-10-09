import { Form } from '@/components/Form'
import { List, type FieldType } from '@/components/List'

export function Food() {
  const fields: FieldType = {
    Name: {

    },
    Protein: {
      type: 'number',
    },
    Fat: {
      type: 'number',
    },
    Carb: {
      type: 'number',
    },
    Fiber: {
      type: 'number',
    },
    Calorie: {
      type: 'number',
    },


  }
  return (
    <>
      <Form
        fields={fields} />
      <List
        fields={fields}
      />
    </>
  )
}