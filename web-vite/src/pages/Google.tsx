import { useEffect, useState } from 'react';

interface UserData {
  id: number;
  email: string;
}

export function Google() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = () => {
    window.location.href = 'http://localhost:3000/login/google';
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/login/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token inválido, remove do localStorage
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Captura o token quando volta do callback
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      // Salva o token no localStorage
      localStorage.setItem('authToken', token);
      
      // Limpa o token da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Busca dados do usuário
      fetchUserData();
    } else {
      // Verifica se já está logado
      fetchUserData();
    }
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Login Google</h1>

      {user ? (
        <div>
          <div className="bg-green-100 p-4 rounded mb-4">
            <h2 className="font-bold">Usuário logado:</h2>
            <p>ID: {user.id}</p>
            <p>Email: {user.email}</p>
          </div>
          
          <button
            className='bg-red-500 p-2 rounded cursor-pointer text-white'
            onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <button
          className='bg-gray-500 p-2 rounded cursor-pointer text-white'
          onClick={signIn}>
          Sign in with Google
        </button>
      )}
    </div>
  )
}