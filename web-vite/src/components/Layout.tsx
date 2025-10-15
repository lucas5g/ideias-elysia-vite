import { useEffect } from "react";
import { NavLink, Outlet } from "react-router";

export function Layout() {

  const links = [
    'Diets',
    'Foods',
    'Users'
  ]

  useEffect(() => {
    const currentPath = window.location.pathname
    const currentLink = links.find(link => `/${link.toLowerCase()}` === currentPath)
    document.title = `Ideias - ${currentLink}`
  }, [])

  return (
    <div className="">
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
      <main>
        <Outlet />
      </main>
    </div>
  )
}