import { useEffect } from "react";
import { NavLink, Outlet } from "react-router";

export function Layout() {

  const links = [
    'Diets',
    'Foods'
  ]

  useEffect(() => {
    const currentPath = window.location.pathname
    const currentLink = links.find(link => `/${link.toLowerCase()}` === currentPath) 
    document.title = `Ideias - ${currentLink}`
  }, [])

  return (
    <div className="flex flex-col gap-1">
      <nav>
        <ul>
          {links.map(link => (
            <li key={link}>
              <NavLink
                to={`/${link.toLowerCase()}`}
                onClick={() => document.title = `Ideias - ${link}`}
                >
                {link}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="p-1 flex flex-col gap-1 lg:flex-row">
      <Outlet />
      </main>
    </div>
  )
}