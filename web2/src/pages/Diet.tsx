import { Form } from "@/components/Form"
import { List } from "@/components/List"
import { api } from "@/utils/api"
import type { FieldInterface } from "@/utils/interfaces"
import { useEffect, useState } from "react"

export function Diet() {
  const resource = '/diets'
  const [mealOptions, setMealOptions] = useState()

  useEffect(() => {
    api.get('/meals').then(res => {
      // Assuming res.data is an array of meals, map to { value, label }
      const options = res.data.map((meal: string) => ({
        value: meal,
        label: meal
      }))
      setMealOptions(options)
    })
  }, [])

  const fields: FieldInterface = {
    Meal: {
      type: 'select',
      options: mealOptions
    },
    Food: {
      type: 'text',
    },
    Quantity: {
      type: 'number',

    }
  }


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