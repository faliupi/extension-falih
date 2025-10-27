import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Auth0Provider } from '@auth0/auth0-react'
import { AUTH0_APP_DOMAIN, AUTH0_AUDIENCE, AUTH0_CLIENT_ID } from './constants.ts'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>,
  <React.StrictMode>
    <Auth0Provider
      domain={AUTH0_APP_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: AUTH0_AUDIENCE,
        redirect_uri: window.location.origin
      }}
    >
      <App />
      <Toaster richColors />
    </Auth0Provider>
  </React.StrictMode>,
)
