import { Input } from "@/components/Input";
import { api } from "@/utils/api";

export function Login() {

  const environments = [
    { label: 'DEV', value: 'https://dev.gerais.mg.def.br' },
    { label: 'TST', value: 'https://tst.gerais.mg.def.br' },
    { label: 'HML', value: 'https://hml.gerais.mg.def.br' },
    { label: 'PRE-PROD', value: 'https://pre-prod.gerais.mg.def.br' },
    { label: 'PRD', value: 'https://gerais.mg.def.br' },
  ];

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();


    const environment = (document.getElementById('environment') as HTMLSelectElement)?.value;
    const cpf = (document.getElementById('CPF') as HTMLInputElement)?.value;
    const senha = (document.getElementById('Senha') as HTMLInputElement)?.value;

    const { data } = await api.post(environment + '/sc/service/login', {
      cpf,
      senha
    });

    console.log(data);
  }

  return (
    <div className="h-screen flex items-center justify-center w-1/2 mx-auto">

      <form className="card" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <div>
          <label htmlFor="environment">Environment</label>
          <select id="environment" name="environment" className="input">
            {environments.map((env) => (
              <option key={env.value} value={env.value}>{env.label}</option>
            ))}
          </select>
        </div>

        <Input name="CPF" />
        <Input name="Senha" />
        <button className="button-primary" type="submit">Login</button>
      </form>
      <form />
    </div>
    //   fields={{
    //     cpf: {
    //       type: 'text',
    //       placeholder: 'CPF',
    //       autoComplete: 'on'
    //     },
    //     Senha: {
    //       type: 'password',
    //       autoComplete: 'current-password'
    //     }
    //   }}
    //   resource="https://dev.gerais.mg.def.br/candidato/service/login"

    //  /> 
  )
}