import { Field, Input, type InputProps } from "@chakra-ui/react";

interface Props extends InputProps {}

export function FieldInput(props: Props){
  return (
    <Field.Root>
      <Field.Label>Label</Field.Label>
      <Input {...props} />
    </Field.Root>
  )
}