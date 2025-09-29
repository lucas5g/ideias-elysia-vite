import { floatingStyles } from "@/components/FieldInput"
import { Field, NativeSelect, type NativeSelectFieldProps } from "@chakra-ui/react"

const options = [
  'INTERROGATIVE',
  'NEGATIVE',
  'STORY',
  'TRANSLATION',
].sort((a, b) => a.localeCompare(b))

interface Props extends NativeSelectFieldProps { }
export function SelectInput(props: Readonly<Props>) {
  return (
    <Field.Root>

      <NativeSelect.Root>
        <NativeSelect.Field
          {...props}
        >
          {options.map((option) => (
            <option key={option} value={option}>{option.toLowerCase()}</option>
          ))}
        </NativeSelect.Field>
      </NativeSelect.Root>
      <Field.Label
        css={floatingStyles}
        htmlFor="type">
        Type
      </Field.Label>
    </Field.Root>
  )

}