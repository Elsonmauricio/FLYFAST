import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    contactMethod: 'email'
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

  const contactMethods = [
    {
      icon: '📞',
      title: 'Telefone',
      details: ['Luanda: +244 948 787 653'],
      action: 'Ligar Agora'
    },
    {
      icon: '💬',
      title: 'WhatsApp',
      details: ['+244 948 787 653', 'Disponível 24/7'],
      action: 'Enviar Mensagem'
    },
    {
      icon: '📧',
      title: 'Email',
      details: ['flyfast163@gmail.com'],
      action: 'Enviar Email'
    }
  ];

  if (submitted) {
    return (
      <div className="card bg-gradient-to-r from-blue-50 to-white">
        <div className="text-center py-12">
          <div className="text-6xl mb-6">✉️</div>
          <h3 className="text-2xl font-bold text-flyfast-blue mb-4">
            Mensagem Enviada!
          </h3>
          <p className="text-gray-600 mb-6">
            Obrigado pelo seu contacto. A nossa equipa responderá em breve.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="btn-primary"
          >
            Enviar Nova Mensagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Methods */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-flyfast-blue mb-6">
            Contacte-nos
          </h2>
          
          {contactMethods.map((method, index) => (
            <div key={index} className="card hover:border-flyfast-blue">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{method.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{method.title}</h3>
                  {method.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 mb-1">{detail}</p>
                  ))}
                  <button className="mt-3 text-flyfast-blue font-semibold hover:text-blue-900">
                    {method.action} →
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* FAQ Link */}
          <div className="card bg-flyfast-light-yellow">
            <h3 className="font-bold text-lg mb-3">❓ Perguntas Frequentes</h3>
            <p className="text-gray-600 mb-4">
              Encontre respostas rápidas para as questões mais comuns.
            </p>
            <button className="text-flyfast-blue font-semibold hover:text-blue-900">
              Ver FAQ Completa →
            </button>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-2xl font-bold text-flyfast-blue mb-6">
              Envie-nos uma Mensagem
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Nome *
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Telemóvel
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+244 923 456 789"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Assunto *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="tracking">Rastreamento de Envio</option>
                    <option value="booking">Reserva de Envio</option>
                    <option value="personal-shopper">Personal Shopper</option>
                    <option value="shop">Loja e Produtos</option>
                    <option value="complaint">Reclamação</option>
                    <option value="suggestion">Sugestão</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Como prefere ser contactado?
                </label>
                <div className="flex space-x-6">
                  {['email', 'whatsapp', 'phone'].map((method) => (
                    <label key={method} className="flex items-center">
                      <input
                        type="radio"
                        name="contactMethod"
                        value={method}
                        checked={formData.contactMethod === method}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="capitalize">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mensagem *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="input-field"
                  placeholder="Descreva a sua questão ou pedido..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newsletter"
                  className="mr-2"
                />
                <label htmlFor="newsletter" className="text-gray-600">
                  Desejo receber novidades e promoções da FLYFAST
                </label>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-4 text-lg"
              >
                📤 Enviar Mensagem
              </button>
            </form>
          </div>

          {/* Response Time Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⏱️</span>
              <div>
                <p className="font-semibold">Tempo de Resposta</p>
                <p className="text-sm text-gray-600">
                  Normalmente respondemos em até 2 horas úteis. Para urgências, 
                  utilize o WhatsApp para resposta imediata.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;