import { useEffect, useMemo } from "react";
import { NavLink, Outlet } from "react-router";

export function Layout() {

  const links = useMemo(() => [
    'Diets',
    'Foods',
    'Users'
  ], [])

  useEffect(() => {
    const currentPath = globalThis.location.pathname
    const currentLink = links.find(link => `/${link.toLowerCase()}` === currentPath)
    document.title = `Ideias - ${currentLink}`
  }, [links])

  return (
    <div className="bg-gray-800 min-h-screen text-white flex flex-col gap-1">
      <nav>
        <ul className='flex gap-3 bg-gray-950 p-5 text-gray-500 font-bold text-2xl border-b border-black'>
          {links.map(link => (
            <li key={link}>
              <NavLink
                className={({ isActive }) => isActive ? 'text-white' : ''}
                to={`/${link.toLowerCase()}`}
                onClick={() => document.title = `Ideias - ${link}`}
              >
                {link}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className='p-1 flex flex-col gap-1 lg:flex-row w-full'>
        <Outlet />
      </main>
    </div>
  )
}