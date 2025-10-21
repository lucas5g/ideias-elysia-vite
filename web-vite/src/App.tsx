import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Food } from './pages/Food'
import { Layout } from '@/components/Layout'
import { Modelo } from '@/pages/modelo/Modelo'
import { Login } from '@/pages/modelo/Login'
import { User } from './pages/Users'
import { Audiobook } from './pages/Audiobook'
import { Diet } from '@/pages/Diet'
import { version } from '../package.json'
import { Home } from './pages/Home'
export function App() {
  console.log(`Running app version: ${version}`)
  return (
    <BrowserRouter>      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<Layout />}>
          <Route path="/foods" element={<Food />} />
          <Route path='/users' element={<User />} />
        </Route>
        <Route path="/diets" element={<Diet />} />
        <Route path="/modelos" element={<Modelo />} />
        <Route path="/modelos/login" element={<Login />} />
        <Route path="/audiobooks" element={<Audiobook />} />

        <Route path="*" element={<Navigate to="/foods" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

