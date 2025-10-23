
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

  // --- ESTILOS PARA CENTRAR ---

  // 1. Estilos para el contenedor que centrará el botón
  const centeringContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center', // Centra horizontalmente
    alignItems: 'center',    // Centra verticalmente
    height: '100%',          // Ocupa todo el alto disponible en <main>
    width: '100%',           // Ocupa todo el ancho disponible en <main>
  };

  // 2. Estilos para tu botón (tomados de tu código)
  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#4A148C',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  };

  // --- HTML (JSX) ---

  return (
    // 3. Usamos un <div> en lugar de <main> y le aplicamos los estilos
    <div style={centeringContainerStyle}>
      <button
        onClick={handleLogin}
        style={buttonStyle} // Usamos los estilos definidos arriba
      >
        Ingresar con Keycloak
      </button>
    </div>
  )
}