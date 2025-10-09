export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { 
  
}
export function Input(props: InputProps) {
  return (
    <input 
      className="input" 
      required
      id={props.name?.toLowerCase()}
      placeholder={props.name}
      {...props}
    />
  )
}