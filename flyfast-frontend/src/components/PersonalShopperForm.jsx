import React, { useState, useEffect } from 'react';
import { usePersonalShopper } from '../hooks/usePersonalShopper';
import { FaSpinner, FaCheckCircle, FaExclamationCircle, FaCloudUploadAlt, FaTimes, FaFilePdf } from 'react-icons/fa';

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
  const [attachment, setAttachment] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const { isLoading, error, isSuccess, submitRequest } = usePersonalShopper();

  // Limpar URL de preview ao desmontar ou mudar imagem para evitar memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelection = (file) => {
    if (!file) return;
    setAttachment(file);
    
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (attachment) {
      data.append('attachment', attachment);
    }

    await submitRequest(data);
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

        <div>
          <label className="label">Imagem ou Ficheiro (Opcional)</label>
          <div 
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
              isDragging ? 'border-flyfast-blue bg-blue-50' : 'border-gray-300 hover:border-flyfast-blue'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {attachment ? (
              <div className="text-center relative w-full">
                <button 
                  type="button" 
                  onClick={removeAttachment}
                  className="absolute top-0 right-0 text-gray-400 hover:text-red-500 p-1"
                  title="Remover ficheiro"
                >
                  <FaTimes />
                </button>
                
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="mx-auto h-48 object-contain rounded mb-2" />
                ) : (
                  <FaFilePdf className="mx-auto h-16 w-16 text-red-500 mb-2" />
                )}
                <p className="text-sm text-green-600 font-semibold">{attachment.name}</p>
                <p className="text-xs text-gray-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-flyfast-blue hover:text-blue-500 focus-within:outline-none">
                    <span>Carregar um ficheiro</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf" />
                  </label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF até 5MB</p>
              </div>
            )}
          </div>
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