"use client";
import React from 'react';
import Link from 'next/link'; 
import './NavBar.css';       

const Navbar: React.FC = () => {

  const handleLogout = () => {
    // Aquí irá la lógica para cerrar sesión
    alert('Cerrando sesión...');
  };

  return (
    <header className="navbar-container">
      
      {/* Sección Izquierda: Logo o Título */}
      <div className="navbar-brand">
        <Link href="/"> {/* Link a la página principal */}
          Control de Stock
        </Link>
      </div>

      {/* Sección Central (links si necesitas) */}
      <div className="navbar-links">
        {/* <Link href="/dashboard">Dashboard</Link> */}
        {/* <Link href="/inventario">Inventario</Link> */}
      </div>

      {/* Sección Derecha: Botones de usuario y notificaciones */}
      <div className="navbar-actions">
        <button className="navbar-icon-button">
          🔔 {/* Ícono de Notificación */}
        </button>
        <button className="navbar-icon-button">
          👤 {/* Ícono de Usuario */}
        </button>
        <button 
          className="navbar-logout-button" 
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default Navbar;