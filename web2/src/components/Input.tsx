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
        {...props}
        className="input"
        required
        id={props.name?.toLowerCase()}
        name={props.name?.toLowerCase()}
        placeholder={props.name}
        step={props.type === 'number' ? '0.01' : undefined}
      />
    </div>
  )
}