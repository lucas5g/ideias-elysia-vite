
import { Layout } from '@/components/Layout';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Translate } from '@/pages/translate';
import { Tests } from '@/pages/tests';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Translate />} />
          <Route path="/translate" element={<Translate />} />
          <Route path='/translate/phrases/:id' element={<Translate />} />
          <Route path="/tests" element={<Tests />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
