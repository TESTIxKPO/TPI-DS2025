import type { Metadata } from 'next';
// importamos los estilos globales
import './globals.css';
// definimos los metadatos de la aplicación

import NavBar from '../componentes/Navbar/NavBar'; // Componente de la barra de navegación

export const metadata: Metadata = {
  title: 'Mi App',
  description: 'Aplicación con Keycloak',
};
// definimos el layout raíz de la aplicación
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <NavBar />
        <main> {/* Aca va el contenido principal de la aplicación */}
          {children} 
        </main>
        <footer>
          {/* Aca podes agregar información del pie de página */}
          <p>© 2024 Una web bien fachera. Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  );
}

