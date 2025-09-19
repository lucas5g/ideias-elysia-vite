import { useState } from "react";
import {
  Box,
  Flex,
  Input,
  Tag,
  TagLabel,
  CloseButton, // <- use esse
} from "@chakra-ui/react";

export default function TagsInput() {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const addTag = (value: string) => {
    const v = value.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
  };

  const removeTag = (value: string) => {
    setTags(tags.filter((t) => t !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
      setInputValue("");
    } else if (e.key === "Backspace" && inputValue === "") {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <Box>
      <Flex
        wrap="wrap"
        gap={2}
        border="1px solid"
        borderColor="purple.400"
        borderRadius="md"
        p={2}
        alignItems="center"
      >
        {tags.map((tag) => (
          <Tag
            size="lg"
            key={tag}
            borderRadius="full"
            variant="solid"
            colorScheme="purple"
            display="inline-flex"
            alignItems="center"
          >
            <TagLabel mr={2}>{tag}</TagLabel>
            <CloseButton
              size="sm"
              onClick={() => removeTag(tag)}
              aria-label={`Remover ${tag}`}
            />
          </Tag>
        ))}

        <Input
          variant="flushed"
          placeholder="Digite e pressione Enter"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          minW="120px"
          flex="1"
        />
      </Flex>
    </Box>
  );
}
