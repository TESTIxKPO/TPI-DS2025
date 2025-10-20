import type { Metadata } from 'next';
// importamos los estilos globales
import './globals.css';
// definimos los metadatos de la aplicación
export const metadata: Metadata = {
  title: 'Mi App',
  description: 'Aplicación con Keycloak',
};
// definimos el layout raíz de la aplicación
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header>
          {/* aca puedo poner mas adelante la navegacion */}
          <nav> barra
            {/* Aca podes agregar enlaces de navegación u otros elementos del encabezado */}
          </nav>
        </header>
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

