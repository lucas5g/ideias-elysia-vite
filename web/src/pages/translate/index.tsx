import { Form } from '@/components/Form';
import { List } from '@/components/List';
import { useState } from 'react';

export interface PhraseInterface {
  id: number;
  portuguese: string;
  english: string;
  tags: string[];
  audioUrl: string;
  type: 'INTERROGATIVE' | 'NEGATIVE' | 'STORY' | 'TRANSLATION';
}
export function Translate() {

  const [uri, setUri] = useState('/phrases');

  return (
    <>
      <Form
        uri={uri}
      />
      <List
        uri={uri}
        setUri={setUri}     
      />
    </>
  );
}
