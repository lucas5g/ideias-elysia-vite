import type { InputProps } from '@/components/Input';

export interface FieldConfig extends Omit<InputProps, 'type'> {
  type: 'text' | 'number' | 'email' | 'password' | 'select';
  options?: { value: string | number; label: string }[];
}


// export type FieldType = Record<string, InputProps | FieldType>
export interface FieldInterface {
  // type: 'select' | 'text' | 'number'
  [key: string]: FieldConfig | FieldInterface
}