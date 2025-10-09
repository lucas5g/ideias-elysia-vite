import { Form } from '@/components/Form'
import { List } from '@/components/List'
import type { FieldInterface } from '@/utils/interfaces'

export function Food() {
  const fields: FieldInterface = {
    Name: {

    },
    // row:{
    //   Protein: {
    //     type: 'number',
    //   },
    //   Fat: {
    //     type: 'number',
    //   }
    // },    
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

  const uri = '/foods'

  return (
    <>
      <Form
        fields={fields}
        uri={uri} />
      <List
        fields={fields}
        uri={uri}
      />
    </>
  )
}