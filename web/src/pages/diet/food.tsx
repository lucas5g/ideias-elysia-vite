import { List } from "@/components/List";
import { useState } from "react";

export function Food() {
  const [uri, setUri] = useState('/phrases');
  return (
    <>
      <h1>Foods</h1>
      <List
        uri={uri}
        setUri={setUri}
      />
    </>
  );
}