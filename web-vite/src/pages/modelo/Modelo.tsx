import { Form } from "@/components/Form";
import { List } from "@/components/List";
import { fetcher } from "@/utils/fetcher";
import type { FieldInterface } from "@/utils/interfaces";
import { useNavigate } from "react-router";

interface ModeloInterface {
  dados: {
    co_seq_modelo: number;
    no_modelo: string;
    ds_modelo: string;
  }[]
}

export function Modelo() {

  const resource = 'https://dev.gerais.mg.def.br/candidato/service/modelos';

  const { data, error, isLoading } = fetcher<ModeloInterface>(resource);
  const navigate = useNavigate();

  console.log(data);
  const fields: FieldInterface = {
    no_modelo: {
      type: 'text',
      placeholder: 'Nome do Modelo',
      // label: 'Nome do Modelo', 
    },
    ds_conteudo_modelo: {
      type: 'text',
      placeholder: 'Descrição do Modelo',
    }
  }

  if (error) {
    navigate('/modelos/login');
    return <div>Redirecting to login...</div>;
  }


  return (
    <main>
      <List
        headers={Object.keys(fields)}
        resource={resource}
        isLoading={isLoading}
        list={data?.dados.map(row => {
          return {
            id: row.co_seq_modelo,
            no_modelo: row.no_modelo,
            ds_conteudo_modelo: row.ds_conteudo_modelo.slice(0, 50),
          }
        })}
      />
      <Form
        fields={fields}
        resource={resource}
      />

    </main>
  )
}