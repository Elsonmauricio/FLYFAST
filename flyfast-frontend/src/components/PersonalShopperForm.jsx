import React, { useState, useEffect } from 'react';
import { usePersonalShopper } from '../hooks/usePersonalShopper';
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const PersonalShopperForm = () => {
  const [formData, setFormData] = useState({
    productName: '',
    productLink: '',
    details: '',
    budget: '',
    deliveryCountry: 'Angola',
    name: '',
    email: '',
    phone: '',
  });

  const { isLoading, error, isSuccess, submitRequest } = usePersonalShopper();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Converter para FormData para compatibilidade com o Multer no backend
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    try {
      await submitRequest(submitData);
    } catch (err) {
      console.error("Erro ao enviar pedido:", err);
    }
  };

  if (isSuccess) {
    return (
      <div className="card text-center p-8">
        <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-flyfast-blue mb-2">Pedido Enviado com Sucesso!</h2>
        <p className="text-gray-600">
          A nossa equipa de Personal Shoppers entrará em contacto consigo em breve com mais detalhes.
        </p>
      </div>
    );
  }

  return (
    <div id="request-form" className="card max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-flyfast-blue mb-8">
        Faça o seu Pedido
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="productName" className="label">Nome do Produto ou Descrição</label>
          <input
            type="text"
            id="productName"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            className="input-field"
            placeholder="Ex: Tênis Nike Air Force 1, tamanho 42"
            required
          />
        </div>
        <div>
          <label htmlFor="productLink" className="label">Link do Produto (Opcional)</label>
          <input
            type="url"
            id="productLink"
            name="productLink"
            value={formData.productLink}
            onChange={handleChange}
            className="input-field"
            placeholder="https://www.exemplo.com/produto"
          />
        </div>
        <div>
          <label htmlFor="details" className="label">Detalhes Adicionais</label>
          <textarea
            id="details"
            name="details"
            value={formData.details}
            onChange={handleChange}
            className="input-field"
            rows="4"
            placeholder="Cor, modelo específico, ou qualquer outra informação relevante."
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="budget" className="label">Orçamento Estimado (Opcional)</label>
            <input
              type="text"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="input-field"
              placeholder="Ex: 50.000 AOA ou 100€"
            />
          </div>
          <div>
            <label htmlFor="deliveryCountry" className="label">País de Entrega</label>
            <select id="deliveryCountry" name="deliveryCountry" value={formData.deliveryCountry} onChange={handleChange} className="input-field" required>
              <option value="Angola">🇦🇴 Angola</option>
              <option value="Portugal">🇵🇹 Portugal</option>
            </select>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-700 pt-4 border-t">Seus Contactos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campos de contacto como nome, email, telefone */}
          <div>
            <label htmlFor="name" className="label">Nome</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label htmlFor="phone" className="label">Telemóvel / WhatsApp</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+244 9xx xxx xxx" required />
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <div className="text-center pt-4">
          <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
            {isLoading ? <><FaSpinner className="animate-spin mr-2" /> A Enviar...</> : 'Enviar Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalShopperForm;