import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBars, FaTimes, FaUser, FaShieldAlt } from 'react-icons/fa';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { authState } = useAuth();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  return (
    <header className="bg-flyfast-blue text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white flex items-center">
          <span className="text-flyfast-yellow mr-1">FLY</span>FAST
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-200 hover:text-white font-medium">Início</Link>
          <Link to="/tracking" className="text-gray-200 hover:text-white font-medium">Rastrear</Link>
          <Link to="/routes" className="text-gray-200 hover:text-white font-medium">Rotas</Link>
          <Link to="/shop" className="text-gray-200 hover:text-white font-medium">Loja</Link>
          <Link to="/personal-shopper" className="text-gray-200 hover:text-white font-medium">Personal Shopper</Link>
          {authState.user?.role === 'admin' && (
            <Link to="/admin" className="text-flyfast-yellow hover:text-yellow-300 font-bold flex items-center">
              <FaShieldAlt className="mr-1" />
              Admin
            </Link>
          )}
        </nav>

        {/* Icons & Auth */}
        <div className="hidden md:flex items-center space-x-6">

          {/* Auth Buttons - A Lógica Principal */}
          {authState.isAuthenticated ? (
            <Link to="/account" className="flex items-center space-x-2 text-white font-semibold hover:text-gray-200">
              <FaUser />
              <span>Minha Conta</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-200 hover:text-white font-medium">
                Entrar
              </Link>
              <Link to="/register" className="btn btn-primary px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                Registar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white focus:outline-none" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="flex flex-col p-4 space-y-4">
            <Link to="/" className="text-gray-600 hover:text-flyfast-blue" onClick={toggleMenu}>Início</Link>
            <Link to="/tracking" className="text-gray-600 hover:text-flyfast-blue" onClick={toggleMenu}>Rastrear</Link>
            <Link to="/shop" className="text-gray-600 hover:text-flyfast-blue" onClick={toggleMenu}>Loja</Link>
            <Link to="/personal-shopper" className="text-gray-600 hover:text-flyfast-blue" onClick={toggleMenu}>Personal Shopper</Link>
            {authState.user?.role === 'admin' && (
              <Link to="/admin" className="text-red-600 font-bold flex items-center" onClick={toggleMenu}>
                <FaShieldAlt className="mr-2" />
                Painel Admin
              </Link>
            )}
            <div className="border-t pt-4 flex flex-col space-y-3">
              {authState.isAuthenticated ? (
                <Link to="/account" className="text-flyfast-blue font-semibold" onClick={toggleMenu}>Minha Conta</Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600" onClick={toggleMenu}>Entrar</Link>
                  <Link to="/register" className="text-flyfast-blue font-semibold" onClick={toggleMenu}>Registar</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;