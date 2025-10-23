
"use client"; // Necesario para usar hooks y estado

import React, { useState } from 'react';
import NavBar from '../Navbar/NavBar';
import Sidebar from '../Sidebar/Sidebar';

// Este componente "envuelve" el layout principal para manejar el estado
export default function AppShell({ children }: { children: React.ReactNode }) {
  
  // 1. Aquí vive el estado. 'false' = oculta por defecto
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 2. Función para cambiar el estado
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* 3. Le pasamos la función de 'toggle' al NavBar */}
      <NavBar onToggleSidebar={toggleSidebar} />

      <div className="layout-middle-container">
        {/* 4. Le pasamos el estado 'isOpen' al Sidebar */}
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className="main-content"> 
          {children} 
        </main>
      </div>
    </>
  );
}