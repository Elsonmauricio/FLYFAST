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

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/personal-shopper" element={<PersonalShopper />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;