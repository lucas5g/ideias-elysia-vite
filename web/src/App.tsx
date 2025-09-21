
import { Layout } from '@/components/Layout';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Translate } from '@/pages/translate/Index';
import { Tests } from '@/pages/tests';
import { TranslateTest } from '@/pages/translate/Test';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Translate />} />
          <Route path="/translate" element={<Translate />} />
          <Route path="/translate/test" element={<TranslateTest />} />

          <Route path="/tests" element={<Tests />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
