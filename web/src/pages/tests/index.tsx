import { HStack, Input, Tag } from "@chakra-ui/react";
import { useState } from "react";

export function Tests() {
  const [tags, setTags] = useState(["Chakra", "React"]);
  return (

    <HStack
      wrap="wrap"
      // spacing={2}
      border="1px solid"
      borderColor="gray.300"
      p={2}
      borderRadius="md"
    >
      {tags.map((tag, i) => (
        <Tag.Root key={i} colorPalette="blue">
          <Tag.Label>{tag}</Tag.Label>
          <Tag.EndElement>
            <Tag.CloseTrigger onClick={() =>
              setTags(tags.filter((_, index) => index !== i))
            } />
          </Tag.EndElement>
        </Tag.Root>
      ))}

      <Input
        // variant="unstyled"
        placeholder="Digite e pressione Enter"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            if (value) {
              setTags([...tags, value]);
              e.currentTarget.value = "";
            }
          }
        }}
      />
    </HStack>
  )
}