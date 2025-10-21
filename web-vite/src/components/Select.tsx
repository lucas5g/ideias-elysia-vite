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
          className="block text-sm font-medium text-white mb-2"
        >
          {props.name}
        </label>
      )}

      <select
        {...props}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
        required
        id={props.id ?? props.name?.toLowerCase()}
        name={props.name?.toLowerCase()}
      >
        <option value="" className="text-gray-400">Selecione {props.name}</option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-700 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}