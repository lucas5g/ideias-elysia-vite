import { AppProvider } from '@/contexts/AppContext';
import { List } from './List';
import { Form } from './Form';

export function Translate() {
  return (
    <AppProvider >
      <Form />
      <List />
    </AppProvider>
  );
}
