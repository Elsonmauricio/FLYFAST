import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FlyfastLogo from '../assets/flyfast-logo.jpg'; // Assumindo que o seu logo está aqui

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-flyfast-blue text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center"> {/* Removido bg-flyfast-yellow e rounded-full se o logo já for redondo/colorido */}
              <img src={FlyfastLogo} alt="FLYFAST Logo" className="h-full w-auto" /> {/* Ajuste o tamanho conforme necessário */}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading">FLYFAST</h1>
              <p className="text-xs text-flyfast-yellow">Voe Connosco!</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-flyfast-yellow transition font-medium">
              Home
            </Link>
            <Link to="/tracking" className="hover:text-flyfast-yellow transition font-medium">
              Rastreio
            </Link>
            <Link to="/routes" className="hover:text-flyfast-yellow transition font-medium">
              Rotas
            </Link>
            <Link to="/shop" className="hover:text-flyfast-yellow transition font-medium">
              Loja
            </Link>
            <Link to="/personal-shopper" className="hover:text-flyfast-yellow transition font-medium">
              Personal Shopper
            </Link>
            <Link to="/contact" className="hover:text-flyfast-yellow transition font-medium">
              Contacto
            </Link>
            <Link 
              to="/account" 
              className="bg-flyfast-yellow text-flyfast-blue px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition shadow-md"
            >
              Área Cliente
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-2xl"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="hover:text-flyfast-yellow transition font-medium py-2">
                Home
              </Link>
              <Link to="/tracking" className="hover:text-flyfast-yellow transition font-medium py-2">
                Rastreio
              </Link>
              <Link to="/routes" className="hover:text-flyfast-yellow transition font-medium py-2">
                Rotas
              </Link>
              <Link to="/shop" className="hover:text-flyfast-yellow transition font-medium py-2">
                Loja
              </Link>
              <Link to="/personal-shopper" className="hover:text-flyfast-yellow transition font-medium py-2">
                Personal Shopper
              </Link>
              <Link to="/contact" className="hover:text-flyfast-yellow transition font-medium py-2">
                Contacto
              </Link>
              <Link 
                to="/account" 
                className="bg-flyfast-yellow text-flyfast-blue px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition text-center"
              >
                Área Cliente
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;