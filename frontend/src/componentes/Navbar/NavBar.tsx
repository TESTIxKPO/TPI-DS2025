// src/componentes/NavBar/NavBar.tsx

"use client"; 
import React from 'react';
import Link from 'next/link'; 
import './NavBar.css';       

interface NavBarProps {
  onToggleSidebar: () => void; 
}

const Navbar: React.FC<NavBarProps> = ({ onToggleSidebar }) => {

  const handleLogout = () => {
    alert('Cerrando sesión...');
  };

  return (
    <header className="navbar-container">
      
      <div className="navbar-brand-container">
        
        {/* botón ☰  */}
        <button onClick={onToggleSidebar} className="navbar-toggle-button">
          ☰
        </button>

        <Link href="/" className="navbar-brand-link">
          Control de Stock
        </Link>
      </div>

      <div className="navbar-links">
        {/* <Link href="/dashboard">Dashboard</Link> */}
        {/* <Link href="/inventario">Inventario</Link> */}
      </div>

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