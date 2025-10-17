import { Loading } from '@/components/Loading';
import { fetcher } from '@/utils/fetcher';

// interface MealInterface {
//   [key: string]: 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER';
// }

export function MealCard() {

  const { data: meals, isLoading } = fetcher<any>('/diets/group-by-meal')

  if (isLoading) {
    return <Loading />
  }
  console.log(meals)

  return (
    <div className='card'>
      {Object.keys(meals).map((meal) => {
        return (
          <table className='border-b border-gray-500'>
            <thead>
              <tr>
                <th>Food</th>
                <th>Qtd.</th>
                <th>Protein</th>
                <th>Fat</th>
                <th>Carbo</th>
                <th>Fiber</th>
                <th>Calorie</th>
              </tr>
            </thead>
            <tbody className='text-sm'>
              {meals[meal].foods.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.protein}</td>
                  <td>{item.fat}</td>
                  <td>{item.carbo}</td>
                  <td>{item.fiber}</td>
                  <td>{item.calorie}</td>
                </tr>
              ))}
              <tr className='bg-gray-700'>
                <td>{meal}</td>
                <td>{<td>{meals[meal].total.quantity}</td>}</td>
                <td>{meals[meal].total.protein}</td>
                <td>{meals[meal].total.fat}</td>
                <td>{meals[meal].total.carbo}</td>
                <td>{meals[meal].total.fiber}</td>
                <td>{meals[meal].total.calorie}</td>
              </tr>
            </tbody>
          </table>
        )
      })}
    </div >
  )
}
