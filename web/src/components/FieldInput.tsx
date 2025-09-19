import { Box, defineStyle, Field, Input, type InputProps } from "@chakra-ui/react";

interface Props extends InputProps {
  label?: string
}
const floatingStyles = defineStyle({
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
export function FieldInput(props: Readonly<Props>) {
  return (
    <Field.Root>

      <Box pos="relative" w="full">
        <Input
          className="peer"
          placeholder=""
          {...props}
        />
        <Field.Label css={floatingStyles}>
          {props.label}
        </Field.Label>
      </Box>

    </Field.Root>
  )
}