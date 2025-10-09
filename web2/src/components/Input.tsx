export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  doesntHaveLabel?: boolean
}



export function Input({doesntHaveLabel, ...props}: Readonly<InputProps>) {
  return (
    <div className="relative">

      {!doesntHaveLabel &&
        <label
          htmlFor={props.name?.toLowerCase()}
          className='text-sm'
        >
          {props.name}
        </label>
      }


      <input
        className="input"
        required
        id={props.name?.toLowerCase()}
        placeholder={props.name}
        {...props}
      />
    </div>
  )
}