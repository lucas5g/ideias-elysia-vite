import { Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router';

export function Layout() {
  return (
    <Flex
      direction={'column'}
      gap={10}
      h={'100vh'}
    >
      {/* <div>
        nav
      </div> */}
      <Flex
        direction={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        gap={'2rem'}
        padding={5}
      >
        <Outlet />
      </Flex>
    </Flex>
  );
}
