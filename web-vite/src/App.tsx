import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Food } from './pages/Food'
import { Layout } from '@/components/Layout'
import { Modelo } from '@/pages/modelo/Modelo'
import { Login } from '@/pages/modelo/Login'
import { User } from './pages/Users'
import { Audiobook } from './pages/Audiobook'
import { Diet } from '@/pages/Diet'
import { AuthCallback } from '@/pages/AuthCallback'
import { version } from '../package.json'
import { Home } from './pages/Home'
import { Google } from './pages/Google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Me } from './pages/Me'

export function App() {
  console.log(`Running app version: ${version}`)
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<Layout />}>
            <Route path="/foods" element={<Food />} />
            <Route path='/users' element={<User />} />
          </Route>
          <Route
            path="/diets"
            element={
              <ProtectedRoute>
                <Diet />
              </ProtectedRoute>
            }
          />
          <Route path="/modelos" element={<Modelo />} />
          <Route path="/modelos/login" element={<Login />} />
          <Route path="/audiobooks" element={<Audiobook />} />
          <Route path="/google" element={<Google />} />
          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <Me />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

