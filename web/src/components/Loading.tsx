
export function Loading() {
  return (
    <div className="animate-pulse text-left space-y-1">

      <div className="flex justify-between">
        <div className="h-3 rounded bg-gray-200 w-[17%]"></div>
        <div className="h-3 rounded bg-gray-200 w-[15%]"></div>
      </div>
      {Array.from({ length: 2 }).map((_) => (

        <div className="flex justify-between align-center items-center gap-9">
          <div className="h-3 rounded bg-gray-100 w-[30%]"></div>
          <div className="size-10 rounded-full bg-gray-200"></div>

        </div>
      ))}

    </div>
  )
}