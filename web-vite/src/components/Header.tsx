interface Props {
  text: string
}
export function Header(props: Readonly<Props>){
  return (
    <h1 className='text-3xl border-b border-gray-600 pb-2'>{props.text}</h1>
  )
}