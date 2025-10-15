export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  doesntHaveLabel?: boolean
  options?: { value: string | number; label: string }[]
}

export function Select({ doesntHaveLabel, options = [], ...props }: Readonly<SelectProps>) {
  return (
    <div className="relative">
      {!doesntHaveLabel && (
        <label
          htmlFor={props.name?.toLowerCase()}
          className='text-sm'
        >
          {props.name}
        </label>
      )}

      <select
        {...props}
        className="input cursor-pointer"
        required
        id={props.id ?? props.name?.toLowerCase()}
        name={props.name?.toLowerCase()}
      >
        <option value="">Selecione {props.name}</option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}