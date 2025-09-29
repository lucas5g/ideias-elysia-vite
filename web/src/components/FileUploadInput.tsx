import { Button, FileUpload } from "@chakra-ui/react";
import { UploadSimpleIcon } from "@phosphor-icons/react";

interface Props {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function FileUploadInput(props: Readonly<Props>) {
  return (
    <FileUpload.Root>
      <FileUpload.HiddenInput
        accept=".mp3, .ogg"
        {...props}

      />
      <FileUpload.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          width={'full'}
        >
          <UploadSimpleIcon /> Select Audio
        </Button>
      </FileUpload.Trigger>
      <FileUpload.List />
    </FileUpload.Root>
  )
}