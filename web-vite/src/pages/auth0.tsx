// src/App.js
import { useAuth0 } from '@auth0/auth0-react';

export function Auth0() {
  const { isLoading, isAuthenticated, error, user, loginWithPopup, loginWithRedirect, logout, } =
    useAuth0();
  
    if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }


  if (isAuthenticated) {
    return (
      <div>
        Hello {user?.name}{' '}
        <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/auth0' } })}>
          Log out
        </button>
      </div>
    );
  } else {
    return (
      <div>
        <button onClick={() => loginWithPopup()}>Log in</button>
        <button onClick={() => loginWithRedirect({ 
          authorizationParams: {
            connection: 'google-oauth2'
          }
        })}>
          Login com Google
        </button>
      </div>
    );
  }
}

