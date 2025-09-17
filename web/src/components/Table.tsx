import { Table as ChakraTable } from '@chakra-ui/react'

interface Props {
  headers: string[],
  children: React.ReactNode

}
export function Table({ headers, children }: Readonly<Props>) {
  return (
    <ChakraTable.Root>
      <ChakraTable.Header>
        <ChakraTable.Row>
          {headers.map((header, index) => (
            <ChakraTable.ColumnHeader
              key={header}
              textAlign={headers.length - 1 === index ? 'right' : 'left'}
            >
              {header}
            </ChakraTable.ColumnHeader>
          ))}
        </ChakraTable.Row>
      </ChakraTable.Header>
      <ChakraTable.Body>
        {children}
      </ChakraTable.Body>
    </ChakraTable.Root>
  )
}