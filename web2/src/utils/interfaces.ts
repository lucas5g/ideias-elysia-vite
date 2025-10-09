import type { InputProps } from '@/components/Input';

// export type FieldType = Record<string, InputProps | FieldType>
export interface FieldInterface {
  [key: string]: InputProps | FieldInterface
}
