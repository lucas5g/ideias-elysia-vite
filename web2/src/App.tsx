import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Food } from './pages/Food'
import { Diet } from '@/pages/Diet'
export function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Food />} />
        <Route path="/foods" element={<Food />} />
        <Route path="/diets" element={<Diet />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  )
}
