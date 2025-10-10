import { api } from '@/utils/api'
import useSWR from 'swr'

export function fetcher<T>(url: string) {
  return useSWR(url, async (url) => {
    const { data } = await api.get(url)
    return data
  })
}