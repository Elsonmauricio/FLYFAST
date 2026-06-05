import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tracking from './pages/Tracking';
import Shop from './pages/Shop';
import PersonalShopper from './pages/PersonalShopper';
import RoutesPage from './pages/Routes';
import Contact from './pages/Contact';
import Account from './pages/Account';
import Login from './pages/Login'; // Importar a nova página de Login
import Register from './pages/Register';
import Admin from './pages/Admin';
import About from './pages/Checkout'; // Sobre Nós + FAQ
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext'; // Importar o AuthProvider
import { ToastProvider } from './contexts/ToastContext'; // Importar o ToastProvider
import ProtectedRoute from './components/ProtectedRoute'; // Importar o ProtectedRoute

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tracking" element={<Tracking />} />
                  <Route path="/tracking/:id" element={<Tracking />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/personal-shopper" element={<PersonalShopper />} />
                  <Route path="/routes" element={<RoutesPage />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Rota Protegida */}
                  <Route 
                    path="/account" 
                    element={<ProtectedRoute><Account /></ProtectedRoute>} 
                  />
                  <Route 
                    path="/admin" 
                    element={<ProtectedRoute><Admin /></ProtectedRoute>} 
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;