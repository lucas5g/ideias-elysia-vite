import { FieldInput } from "@/components/FieldInput";
import { Flex, Tag } from "@chakra-ui/react";

interface Props {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  tag: string;
  setTag: React.Dispatch<React.SetStateAction<string>>;
  error?: string;
}


export function TagsInput({ tags, setTags, tag, setTag, error }: Props) {
  function addTag(event: React.KeyboardEvent<HTMLInputElement>) {


    if (event.key !== ' ' || tag === '') {
      return event
    }


    event.preventDefault();
    const newTags = [...new Set([...tags, tag])];
    setTags(newTags);
    event.currentTarget.value = '';
    return event
  }
  return (
    <Flex direction={'column'} gap={1}>
      <FieldInput
        label="Tag"
        name="tag"
        onKeyDown={addTag}
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        error={error}
      />
      <Flex gap={2}>
        {tags.map((tag) => (
          <Tag.Root key={tag}>
            <Tag.Label>{tag}</Tag.Label>
            <Tag.EndElement>
              <Tag.CloseTrigger
                cursor={'pointer'}
                onClick={() => setTags(tags.filter(row => row !== tag))}
              />

            </Tag.EndElement>
          </Tag.Root>
        ))}
      </Flex>
    </Flex>
  )
}