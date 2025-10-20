'use client'
import { useEffect } from 'react'
import keycloak from '../lib/keycloak'
import { useRouter } from 'next/navigation'



export default function Page() {

  const router = useRouter()
  
  useEffect(() => {
    keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    })
    .then((authenticated) => {
      if (authenticated) {
        console.log('Usuario autenticado', keycloak.tokenParsed?.preferred_username) // esto es solo para debug
        router.push('/dashboard') //esto redirige al dashboard si ya esta logueado
      }
    })
     .catch((err) => console.error('Error inicializando Keycloak:', err))
  }, [router])

  const handleLogin = () => keycloak.login()

  return (
    <main style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
      <button
        onClick={handleLogin}
        style={{
          backgroundColor: '#4A148C',
          color: 'white',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Ingresar con Keycloak
      </button>
    </main>
  )
}
