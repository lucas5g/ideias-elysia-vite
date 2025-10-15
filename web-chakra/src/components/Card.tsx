import { Card as ChakraCard } from '@chakra-ui/react'
interface Props {
  title: string
  children: React.ReactNode
}
export function Card({ title, children }: Readonly<Props>) {
  return (
    <ChakraCard.Root
      width={'100%'}
    >
      <ChakraCard.Header>
        <ChakraCard.Title>{title}</ChakraCard.Title>
      </ChakraCard.Header>
      <ChakraCard.Body gap={3}>
        {children}
      </ChakraCard.Body>
    </ChakraCard.Root>
  )
}