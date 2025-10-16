import { Form } from "@/components/Form";
import { List } from "@/components/List";
import type { FieldInterface } from "@/utils/interfaces";


export function Modelo() {

  const resource = 'https://dev.gerais.mg.def.br/candidato/service/modelos';

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

  return (
    <main>
      <List
        headers={Object.keys(fields)}
        resource={resource}     
      
        
      />
      <Form
        fields={fields}
        resource={resource}
      />

    </main>
  )
}