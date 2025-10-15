import { Form } from "@/components/Form"
import { List } from "@/components/List"
import { Loading } from "@/components/Loading"
import { fetcher } from "@/utils/fetcher"
import type { FieldInterface } from "@/utils/interfaces"


export function Diet() {
  const resource = '/diets'


  const { data: meals } = fetcher<string[]>('/meals')
  const { data: foods } = fetcher<{ id: number, name: string }[]>('/foods')
  const { data: report } = fetcher<Record<string, number>>('/diets/report')

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

  const headers = [...Object.keys(fields), 'Protein', 'Fat', 'Carbo', 'Fiber', 'Calorie']

  if (!meals || !foods || !report) {
    return <Loading />
  }

  return (
    <>
      <Form
        fields={fields}
        resource={resource}
      />


      <List
        headers={headers}
        resource={resource}
      />

      <div className="card lg:w-1/3">
        <h1>Report</h1>
        <table>
          <thead>
            <tr>
              <th>Macro</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(report).map(([key, value]) => (
              <tr key={key}>
                <td className="font-bold">{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}