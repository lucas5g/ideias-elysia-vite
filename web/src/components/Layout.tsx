import { Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router';

export function Layout() {
  return (
    <Flex
      direction={'column'}
      gap={10}
      h={'100vh'}
    >

      <Flex
        direction={{
          base: 'column',
          md: 'row'
        }}
        alignItems={{
          base: 'center',
          md: 'flex-start'
        }}
        justifyContent={'center'}
        gap={'1.5rem'}
        padding={5}

      >
        <Outlet />
      </Flex>
    </Flex>
  );
}
