import { Field, Input, type InputProps } from "@chakra-ui/react";

interface Props extends InputProps {
  label?: string
}

export function FieldInput(props: Readonly<Props>) {
  return (
    <Field.Root>
      {props.label &&
        <Field.Label>
          {props.label}
        </Field.Label>
      }
      <Input
        placeholder={props.label}
        {...props}
      />
    </Field.Root>
  )
}