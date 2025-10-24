export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  doesntHaveLabel?: boolean
}



export function Input({doesntHaveLabel, ...props}: Readonly<InputProps>) {
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

      <input
        {...props}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none [-webkit-appearance:none] [color-scheme:dark]"
        required
        id={props.name?.toLowerCase()}
        name={props.name?.toLowerCase()}
        placeholder={props.placeholder ?? props.name}
        step={props.type === 'number' ? '0.01' : undefined}
      />
    </div>
  )
}