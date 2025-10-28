import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

const paths = [
  { path: '/', label: 'Home' },
  { path: '/foods', label: 'Foods' },
  { path: '/users', label: 'Users' },
  { path: '/modelos', label: 'Modelos' },
  { path: '/audiobooks', label: 'Audiobooks' },
  { path: '/shooter', label: 'Shooter' },
  { path: '/diets', label: 'Diets' },
  { path: '/me', label: 'Me' },
]

export function MenuHamburguer() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        className="bg-gray-900 hover:bg-gray-800 border-none rounded-full w-10 h-10 flex items-center justify-center shadow transition-colors cursor-pointer"
        aria-label="Abrir menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="relative w-[22px] h-[2px] bg-gray-200 rounded block">
          <span className="absolute left-0 top-[-7px] w-[22px] h-[2px] bg-gray-200 rounded transition-all" />
          <span className="absolute left-0 top-[7px] w-[22px] h-[2px] bg-gray-200 rounded transition-all" />
        </span>
      </button>
      {open && (
        <nav className="absolute top-12 right-0 bg-gray-900 rounded-lg shadow-lg py-2 px-4 flex flex-col min-w-[140px] gap-2 animate-fade-in border border-gray-800">
          {paths.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className="text-gray-100 no-underline text-base px-2 py-1 rounded hover:bg-gray-800 hover:cursor-pointer transition-colors cursor-pointer"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
