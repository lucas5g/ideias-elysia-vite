import { Form } from "@/components/Form"
import { List } from "@/components/List"
import { Loading } from "@/components/Loading"
import { fetcher } from "@/utils/fetcher"
import type { FieldInterface } from "@/utils/interfaces"


export function Diet() {
  const resource = '/diets'


  const { data: meals } = fetcher<string[]>('/meals')
  const { data: foods } = fetcher<{ id: number, name: string }[]>('/foods')
  const { data: report } = fetcher<{ totalProtein: number, totalFat: number, totalCalorie: number }>('/diets/report')

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

  if (!meals || !foods || !report) {
    return <Loading />
  }

  return (
    <>
      <List
        headers={headers}
        resource={resource}
      />
      <Form
        fields={fields}
        resource={resource} />


      <div className="card">
        <h1>Report</h1>
        <table>
          <thead>
            <tr>
              <th>Macro</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(report).map((key) => (
              <tr key={key}>
                <td className="font-bold">{key.replace('total', '')}</td>
                <td>{report[key as keyof typeof report].toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* <List
        headers={Object.keys(report)}
        resource="diets/report"
      /> */}
    </>
  )
}