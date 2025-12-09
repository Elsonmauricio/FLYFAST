import React, { useState } from 'react';

const PersonalShopperForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    product: '',
    description: '',
    link: '',
    budget: '',
    country: 'Angola',
    urgency: 'normal'
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="card bg-gradient-to-r from-green-50 to-white">
        <div className="text-center py-12">
          <div className="text-6xl mb-6">✅</div>
          <h3 className="text-2xl font-bold text-green-700 mb-4">
            Pedido Enviado com Sucesso!
          </h3>
          <p className="text-gray-600 mb-6">
            A nossa equipa de Personal Shopper já recebeu o seu pedido e entrará 
            em contacto consigo em breve.
          </p>
          <p className="text-sm text-gray-500">
            Número do pedido: PS-{Date.now().toString().slice(-8)}
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="mt-8 btn-primary"
          >
            Fazer Novo Pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">👔</div>
        <h2 className="text-2xl font-bold text-flyfast-blue">
          Personal Shopper FLYFAST
        </h2>
        <p className="text-gray-600 mt-2">
          Encontramos e enviamos qualquer produto de Portugal para Angola ou vice-versa
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Telemóvel *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="+244 923 456 789"
          />
        </div>

        {/* Product Info */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Produto Desejado *
          </label>
          <input
            type="text"
            name="product"
            value={formData.product}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Ex: Tênis Nike Air Max 270, iPhone 15 Pro, etc."
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Descrição Detalhada
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="input-field"
            placeholder="Cor, tamanho, modelo específico, características importantes..."
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Link do Produto (se souber)
          </label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleChange}
            className="input-field"
            placeholder="https://exemplo.com/produto"
          />
        </div>

        {/* Budget & Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Orçamento Estimado *
            </label>
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Ex: 50.000 AOA / 250€"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              País de Entrega *
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Angola">🇦🇴 Angola</option>
              <option value="Portugal">🇵🇹 Portugal</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Urgência do Pedido
          </label>
          <div className="flex space-x-4">
            {['Baixa', 'Normal', 'Alta', 'Muito Alta'].map((level) => (
              <label key={level} className="flex items-center">
                <input
                  type="radio"
                  name="urgency"
                  value={level.toLowerCase()}
                  checked={formData.urgency === level.toLowerCase()}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Terms & Submit */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <label className="flex items-start">
            <input
              type="checkbox"
              required
              className="mt-1 mr-2"
            />
            <span className="text-sm text-gray-600">
              Concordo com os termos do serviço Personal Shopper. 
              Entendo que será cobrada uma taxa de serviço de 15% sobre o valor do produto 
              (mínimo 5.000 AOA / 25€) além dos custos de envio.
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full btn-primary py-4 text-lg"
        >
          📤 Enviar Pedido de Personal Shopper
        </button>

        <p className="text-center text-sm text-gray-500">
          Entraremos em contacto consigo em até 24 horas para confirmar o pedido.
        </p>
      </form>
    </div>
  );
};

export default PersonalShopperForm;