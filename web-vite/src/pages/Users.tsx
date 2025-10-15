import { Form } from '@/components/Form';
import { List } from '@/components/List';
import type { FieldInterface } from '@/utils/interfaces';

export function User() {
  const resource = 'users'
  const fields: FieldInterface = {
    Weight: {
      type: 'number',
    },
    Calorie: {
      type: 'number',
    }
  }


  return (
    <>
      <Form
        fields={fields}
        resource={resource}

      />
      <List
        headers={Object.keys(fields)}
        resource={resource}
      />
    </>
  )
}