import { Form } from "@/components/Form";
import { List } from "@/components/List";
import { fetcher } from "@/utils/fetcher";
import type { FieldInterface } from "@/utils/interfaces";
import { useNavigate } from "react-router";

export function Modelo() {

  const resource = 'https://dev.gerais.mg.def.br/candidato/service/modelos';

  const { data, error } = fetcher(resource);
  const navigate = useNavigate();

  console.log(data);
  const fields: FieldInterface = {
    no_modelo: {
      type: 'text',
      placeholder: 'Nome do Modelo',
      // label: 'Nome do Modelo', 
    },
    ds_modelo: {
      type: 'text',
      placeholder: 'Descrição do Modelo',
    }
  }

  if (error) {
    navigate('/modelos/login');
    return <div>Redirecting to login...</div>;
  }


  return (
    <>
      <Form
        fields={fields}
        resource={resource}
      />
      <List
        headers={Object.keys(fields)}
        resource={resource}
      />
    </>
  )
}