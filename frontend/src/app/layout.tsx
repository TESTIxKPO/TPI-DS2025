import type { Metadata } from 'next';
// importamos los estilos globales
import './globals.css';
// definimos los metadatos de la aplicación

import NavBar from '../componentes/Navbar/NavBar'; // Componente de la barra de navegación
import Sidebar from '../componentes/Sidebar/Sidebar'; // Componente de la barra lateral
import AppShell from '../componentes/Appshell/Appshell'; // Componente que maneja el layout con estado

export const metadata: Metadata = {
  title: 'Mi App',
  description: 'Aplicación con Keycloak',
};
// definimos el layout raíz de la aplicación
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <main> {/* Aca va el contenido principal de la aplicación */}
          <AppShell>
            {children} 
          </AppShell> 
        </main>
        <footer>
          {/* Aca podes agregar información del pie de página */}
          <p>© 2024 Una web bien fachera. Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  );
}

