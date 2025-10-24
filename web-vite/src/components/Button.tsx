export function Button(props: Readonly<React.ButtonHTMLAttributes<HTMLButtonElement>>) {
  const baseClasses = "cursor-pointer w-full font-bold py-3 px-4 rounded-lg disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2"
  
  const variantClasses = props.type === 'submit' 
    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white disabled:bg-blue-400" 
    : "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white disabled:bg-gray-500"
  
  return (
    <button 
      {...props} 
      className={`${baseClasses} ${variantClasses} ${props.className || ''}`}
    >
      {props.children}
    </button>
  )
}