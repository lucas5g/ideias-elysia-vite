import { Form } from "@/components/Form"
import { List } from "@/components/List"
import type { FieldInterface } from "@/utils/interfaces"

export function Diet() {
  const fields: FieldInterface = {
    Name: {

    },
    Description: {
      type: 'textarea',
    },
    StartDate: {
      type: 'date',
    },
    EndDate: {
      type: 'date',
    },
  }

  const resource = '/diets'

  return (
    <>
      <Form
        fields={fields}
        resource={resource} />
      <List
        fields={fields}
        resource={resource}
      />
    </>
  )
}