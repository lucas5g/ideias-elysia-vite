import { Input } from "./Input";
import type { FieldType } from "./List";

interface Props {
  fields: FieldType
}
export function Form({ fields }: Readonly<Props>) {
  return (
    <form className="card">

      <h1>
        Form
      </h1>
      {Object.keys(fields).map((field) => (
        <Input key={field} name={field} {...fields[field]} />
      ))}

      <button className="button-primary" type="submit">
        Save
      </button>
      <button className="button-secondary" type="reset">
        Cancel
      </button>
      <button type="button" className="button-delete">
        Delete
      </button>
    </form>
  )
}