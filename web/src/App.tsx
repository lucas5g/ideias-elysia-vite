
import { Layout } from '@/components/Layout';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Translate } from '@/pages/Translate/Index';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Translate />} />
          <Route path="/translate" element={<Translate />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
