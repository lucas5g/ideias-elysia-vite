import { BrowserRouter, Route, Routes } from 'react-router'
import { Food } from './pages/Food'
export function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Food />} />
        <Route path="/foods" element={<Food />} />
      </Routes>
    </BrowserRouter>
  )
}
