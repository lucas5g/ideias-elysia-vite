import { Box, defineStyle, Field, Input, type InputProps } from "@chakra-ui/react";

interface Props extends InputProps {
  label?: string
  error?: string

}
export const floatingStyles = defineStyle({
  pos: "absolute",
  bg: "gray.950",
  px: "0.5",
  top: "-3",
  insetStart: "2",
  fontWeight: "normal",
  pointerEvents: "none",
  transition: "position",
  _peerPlaceholderShown: {
    color: "fg.muted",
    top: "2.5",
    insetStart: "3",
  },
  _peerFocusVisible: {
    color: "fg",
    top: "-3",
    insetStart: "2",
  },
})
export function FieldInput({ error, ...props }: Readonly<Props>) {

  return (
    <Field.Root invalid={!!error}>

      <Box pos="relative" w="full">
        <Input
          className="peer"
          placeholder=""
          id={props.name}
          {...props}
        />
        <Field.Label css={floatingStyles}>
          {props.label}
        </Field.Label>
      </Box>
      {error &&
        <Field.ErrorText>
          {error}
        </Field.ErrorText>
      }
    </Field.Root>
  )
}