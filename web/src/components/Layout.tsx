import { Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router';

export function Layout() {
  return (
    <Flex 
      direction={'column'} 
      alignItems={'center'}
      justifyContent={'center'}
      h={'100vh'}
      gap={'2rem'}
      padding={5}
      >
      <Outlet />
    </Flex>
  );
}
