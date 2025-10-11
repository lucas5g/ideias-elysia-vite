import { Link, Outlet } from "react-router";

export function Layout() {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/foods">Foods</Link>
          </li>
          <li>
            <Link to="/diets">Diets</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  )
}