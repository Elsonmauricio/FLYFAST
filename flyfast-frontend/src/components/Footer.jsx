import React from 'react';
import { Link } from 'react-router-dom';
import FlyfastLogo from '../assets/flyfast-logo.jpg'; // Assumindo que o seu logo está aqui

const Footer = () => {
  return (
    <footer className="bg-flyfast-blue text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center"> {/* Removido bg-flyfast-yellow e rounded-full se o logo já for redondo/colorido */}
                            <img src={FlyfastLogo} alt="FLYFAST Logo" className="h-full w-auto" /> {/* Ajuste o tamanho conforme necessário */}
                          </div>
              <h2 className="text-2xl font-bold font-heading">FLYFAST</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Conectando Luanda e Lisboa com velocidade e confiança desde 2020.
            </p>
            <p className="text-flyfast-yellow font-bold text-lg">
              VOE CONNOSCO!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-flyfast-yellow">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/tracking" className="hover:text-flyfast-yellow transition">
                  Rastrear Envio
                </Link>
              </li>
              <li>
                <Link to="/routes" className="hover:text-flyfast-yellow transition">
                  Próximas Rotas
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-flyfast-yellow transition">
                  Loja Online
                </Link>
              </li>
              <li>
                <Link to="/personal-shopper" className="hover:text-flyfast-yellow transition">
                  Personal Shopper
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-flyfast-yellow transition">
                  Contacte-nos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-flyfast-yellow">Contactos</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <span>📞</span>
                <span>Luanda: +244 948 787 653</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>📧</span>
                <span>flyfast163@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>💬</span>
                <span>WhatsApp: +244 948 787 653</span>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-flyfast-yellow">Nossas Sedes</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold">🇦🇴 Angola</h4>
                <p className="text-gray-300">
                  Rua da Missão, 123<br />
                  Luanda, Angola
                </p>
              </div>
              <div>
                <h4 className="font-bold">🇵🇹 Portugal</h4>
                <p className="text-gray-300">
                  Rua João Villaret 7, Queluz 2745-285 <br />
                  Lisboa, Portugal
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© 2025 FLYFAST. Todos os direitos reservados.</p>
          <p className="mt-2">
            Desenvolvido com ❤️ para conectar Angola e Portugal
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;