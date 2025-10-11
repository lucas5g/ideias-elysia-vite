import type { InputProps } from '@/components/Input';
import type { SelectProps } from '@/components/Select';

// Interface base sem o campo 'type'
interface BaseFieldConfig {
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'hidden';
  options?: { value: string | number; label: string }[];
}

// Para campos de input
interface InputFieldConfig extends BaseFieldConfig, Omit<InputProps, 'type'> {
  type: 'text' | 'number' | 'email' | 'password' | 'hidden';
}

// Para campos de select
interface SelectFieldConfig extends BaseFieldConfig, Omit<SelectProps, 'type'> {
  type: 'select';
  options: { value: string | number; label: string }[];
}

// União das configurações
export type FieldConfig = InputFieldConfig | SelectFieldConfig;

export interface FieldInterface {
  [key: string]: FieldConfig ;
}

export interface ItemInterface {
  id: number;
  [key: string]: string | number;
}