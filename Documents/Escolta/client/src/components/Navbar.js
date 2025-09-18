import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Escolta Platform
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={isActive('/')}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/scanner" className={isActive('/scanner')}>
              Scanner QR
            </Link>
          </li>
          <li>
            <Link to="/logs" className={isActive('/logs')}>
              Logs
            </Link>
          </li>
          {user?.role === 'adm' && (
            <li>
              <Link to="/admin" className={isActive('/admin')}>
                Admin
              </Link>
            </li>
          )}
        </ul>
        
        <div className="navbar-user">
          <div className="user-info">
            <span>{user?.username}</span>
            <span className={`badge ${
              user?.role === 'adm' ? 'badge-adm' : 
              user?.role === 'escolta' ? 'badge-escolta' : 
              'badge-primary'
            }`}>
              {user?.role === 'adm' ? 'Admin' : 
               user?.role === 'escolta' ? 'Escolta' : 
               'Cliente'}
            </span>
          </div>
          <button onClick={logout} className="btn btn-secondary">
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
