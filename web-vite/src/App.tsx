import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Food } from './pages/Food'
import { Diet } from '@/pages/Diet'
import { Layout } from '@/components/Layout'
import { Modelo } from '@/pages/modelo/Modelo'
import { Login } from '@/pages/modelo/Login'
import { User } from './pages/Users'
import { DietNew } from './pages/Diet-new'
import { Audiobook } from './pages/Audiobook'
import { DietNew2 } from '@/pages/Diet-new-2'
export function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Food />} />
          <Route path="/foods" element={<Food />} />
          <Route path="/diets" element={<Diet />} />
          <Route path="/diets-new" element={<DietNew />} />
          <Route path='/users' element={<User />} />
        </Route>
        <Route path="/modelos" element={<Modelo />} />
        <Route path="/modelos/login" element={<Login />} />
        <Route path="/audiobooks" element={<Audiobook />} />
        <Route path="/diets-new-2" element={<DietNew2 />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

