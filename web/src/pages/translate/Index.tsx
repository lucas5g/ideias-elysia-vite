import { Form } from '@/components/Form';
import { List } from '@/components/List';
import { AppProvider } from '@/contexts/AppContext';

export function Translate() {
  return (
    <AppProvider >
      <Form />
      <List />
    </AppProvider>
  );
}
