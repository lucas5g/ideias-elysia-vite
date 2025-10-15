import { Input } from "@/components/Input";
import { api } from "@/utils/api";
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export function Login() {

  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const navigate = useNavigate();

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
    const cpf = (document.getElementById('cpf') as HTMLInputElement)?.value;
    const senha = (document.getElementById('senha') as HTMLInputElement)?.value;

    console.log({ environment, cpf, senha });

    try{

      setIsLoadingButton(true);
      const { data } = await api.post(environment + '/scsdp/service/login/interno', {
        cpf,
        senha
      });
      
      localStorage.setItem('token', `Bearer ${data}`);
      
      navigate('/modelos');
      
    }catch(e){
      if(e instanceof AxiosError){
        alert(e.response?.data);
      }
    }finally{
      setIsLoadingButton(false);      
    }

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
        <Input name="Senha" type='password' />
        <button
          disabled={isLoadingButton}
          className="button-primary"
          type="submit">
          Login
        </button>
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