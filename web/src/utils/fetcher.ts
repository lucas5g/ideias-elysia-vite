import { api } from '@/utils/api';
import swr from 'swr'
export function fetcher<T>(
  uri: string,
) {
  return swr(uri,
    async () => {
      // await delay(3000)
      const { data } = await api.get<T>(uri)
      return data

    }
  )
}
