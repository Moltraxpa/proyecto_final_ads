import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <h1>🏪 Papelería Dohko</h1>
          <p>Sistema de Gestión Integral</p>
        </div>
        <div className="header-info">
          <div className="ubicacion">
            📍 Solanda, Quito - Ecuador
          </div>
          <div className="fecha">
            📅 {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
