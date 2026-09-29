import React, { useState } from 'react';
import { FaTimes, FaPlane, FaWeightHanging, FaBoxOpen, FaSpinner } from 'react-icons/fa';
import { parsePrice } from './formatting';

const BookingModal = ({ isOpen, onClose, route, onSubmit, isLoading, pricePerKg }) => {
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen || !route) return null;

  const kgToUse = parsePrice(pricePerKg);
  const routePrice = parsePrice(route.price);
  const effectivePricePerKg = Number.isFinite(kgToUse) ? kgToUse : routePrice;
  const parsedWeight = parseFloat(weight);
  const estimatedPrice = Number.isFinite(parsedWeight) && Number.isFinite(effectivePricePerKg)
    ? Math.round(parsedWeight * effectivePricePerKg * 100) / 100
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      routeId: route.id,
      weight: parseFloat(weight),
      items: [description], // Envia como array de itens
      from: route.from,
      to: route.to
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-flyfast-blue text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FaPlane /> Reservar Envio
            </h3>
            <p className="text-blue-200 text-sm mt-1">
              {route.from} → {route.to} • {new Date(route.date).toLocaleDateString('pt-PT')}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:text-flyfast-yellow transition">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
              <FaWeightHanging className="text-flyfast-blue" /> Peso Estimado (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max={route.available}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flyfast-blue focus:outline-none"
              placeholder={`Máximo disponível: ${route.available}kg`}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Preço estimado: {estimatedPrice.toLocaleString('pt-PT', {style: 'currency', currency: 'EUR'})}
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
              <FaBoxOpen className="text-flyfast-blue" /> Descrição do Conteúdo
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flyfast-blue focus:outline-none"
              rows="3"
              placeholder="Ex: Roupas, Documentos, Eletrónicos..."
              required
            ></textarea>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 border border-yellow-200">
            <p><strong>Nota:</strong> O seu pedido ficará "Pendente" até confirmação do pagamento. Receberá um email com os detalhes.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-flyfast-blue text-white rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;