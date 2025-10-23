
"use client";

import React from 'react';
import Link from 'next/link';
import './Sidebar.css';

// 1. Definimos las Props que va a recibir
interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    // 2. Aplicamos la clase 'open' o 'closed' según la prop
    <aside className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        
        {/* 3. Separamos ícono y texto para poder ocultar el texto */}
        <Link href="/" className="sidebar-link">
          🏠
          <span className="sidebar-link-text">Home</span>
        </Link>
        
        <Link href="/productos" className="sidebar-link">
          📦
          <span className="sidebar-link-text">Productos</span>
        </Link>
        
        <Link href="/inventario" className="sidebar-link">
          📊
          <span className="sidebar-link-text">Inventario</span>
        </Link>
        
        <Link href="/reportes" className="sidebar-link">
          📈
          <span className="sidebar-link-text">Reportes</span>
        </Link>

      </nav>
    </aside>
  );
};

export default Sidebar;