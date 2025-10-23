import { createAuthClient } from 'better-auth/client'
export function Google() {

  const authClient = createAuthClient()
  const signIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: 'http://localhost:5173/google',
      fetchOptions: {
        baseURL: 'http://localhost:3000/auth/api',
      }
    })
  }

  return (
    <div>
      <h1>Login Google</h1>

      <button
        className='bg-gray-500 p-2 rounded cursor-pointer text-white'
        onClick={signIn}>
        Sign in with Google
      </button>

    </div>
  )
}