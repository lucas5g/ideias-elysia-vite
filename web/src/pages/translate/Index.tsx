import { Form } from '@/components/Form';
import { List } from '@/components/List';
import { useState } from 'react';

export interface PhraseInterface {
  id: number;
  portuguese: string;
  english: string;
  tags: string[];
  audio: string;
  type: 'INTERROGATIVE' | 'NEGATIVE' | 'STORY' | 'TRANSLATION';
}
export function Translate() {

  const [phrase, setPhrase] = useState<PhraseInterface>({
    id: 0,
    portuguese: '',
    english: '',
    tags: [],
    audio: '',
    type: 'INTERROGATIVE'
  });

  return (
    <>
      <Form
        phrase={phrase}
        setPhrase={setPhrase}
      />
      <List />     
    </>
  );
}
