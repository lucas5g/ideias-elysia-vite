
import { Layout } from '@/components/Layout';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Translate } from '@/pages/translate';
import { Tests } from '@/pages/tests';
import { Diet } from '@/pages/diet';
import { Food } from './pages/diet/food';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Translate />} />
          <Route path="/translate" element={<Translate />} />
          <Route path='/translate/phrases/:id' element={<Translate />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/diet/foods" element={<Food />} />          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
