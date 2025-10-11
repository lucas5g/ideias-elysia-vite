import { Form } from "@/components/Form"
import { List } from "@/components/List"
import { Loading } from "@/components/Loading"
import { fetcher } from "@/utils/fetcher"
import type { FieldInterface } from "@/utils/interfaces"


export function Diet() {
  const resource = '/diets'


  const { data: meals } = fetcher<string[]>('/meals')
  const { data: foods } = fetcher<{ id: number, name: string }[]>('/foods')


  const fields: FieldInterface = {
    Meal: {
      type: 'select',
      options: meals?.map((meal) => ({ value: meal, label: meal })) || [],

    },
    Food: {
      type: 'select',
      options: foods?.map((food) => ({ value: food.id, label: food.name })) || [],
      id: 'foodId',
    },
    Quantity: {
      type: 'number',
    },
  }

  const headers = [...Object.keys(fields), 'Protein', 'Fat', 'Calorie']

  if (!meals || !foods) {
    return <Loading />
  }

  return (
    <>
      <Form
        fields={fields}
        resource={resource} />
      <List
        headers={headers}
        resource={resource}
      />
    </>
  )
}