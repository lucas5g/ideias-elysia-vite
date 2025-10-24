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
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer appearance-none [-webkit-appearance:none] [color-scheme:dark] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23fff%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
        required
        id={props.id ?? props.name?.toLowerCase()}
        name={props.name?.toLowerCase()}
      >
        <option value="" className="text-gray-400 bg-gray-800">Selecione {props.name}</option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-800 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}