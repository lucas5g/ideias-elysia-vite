import { Flex, Text } from "@chakra-ui/react";
import { BugIcon } from "@phosphor-icons/react";

export function Error() {
  return (

    <Flex direction={'column'} alignItems={'center'} justifyContent={'center'} gap={4} padding={8} textAlign={'center'}>
      <Text>
        Oops... Something went wrong!
      </Text>
      <BugIcon size={50} />
    </Flex>
  )
}