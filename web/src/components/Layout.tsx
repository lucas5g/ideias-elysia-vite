import { Outlet } from 'react-router';

export function Layout() {
  return (
    <main className="flex flex-col min-h-screen p-5 bg-gray-950 text-white gap-5">
      <Outlet />
    </main>
  );
}
