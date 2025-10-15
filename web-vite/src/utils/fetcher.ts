import { api } from '@/utils/api'
import useSWR from 'swr'

export function fetcher<T>(url: string) {
  return useSWR<T>(url, async () => {
    const { data } = await api.get(url)
    return data
  })
}