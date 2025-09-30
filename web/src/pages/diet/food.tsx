import { List } from "@/components/food/List";
import { Form } from "@/components/Form";
import { useState } from "react";

export interface FoodInterface {
  id: number;
  name: string
  protein: number 
  fat: number
  carbo: number
  fiber: number
  calorie: number
}
export function Food() {
  const [uri, setUri] = useState('/foods');
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