// import React, { useState } from 'react';
// import { useCart } from '../contexts/CartContext';
// import { useCheckout } from '../hooks/useCheckout';
// import { FaSpinner, FaLock, FaExclamationCircle } from 'react-icons/fa';

// const Checkout = () => {
//   const { cartState } = useCart();
//   const { items } = cartState;
//   const { isLoading, error, placeOrder } = useCheckout();

//   const [address, setAddress] = useState({
//     street: '',
//     city: '',
//     zip: '',
//     country: 'Angola',
//   });
//   const [paymentMethod, setPaymentMethod] = useState('paypal');

//   const handleAddressChange = (e) => {
//     setAddress({ ...address, [e.target.name]: e.target.value });
//   };

//   const calculateTotal = () => {
//     const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
//     const shippingCost = subtotal > 50000 ? 0 : 5000;
//     return subtotal + shippingCost;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await placeOrder({ address, paymentMethod });
//   };

//   return (
//     <div className="container mx-auto px-4 py-12">
//       <h1 className="text-3xl font-bold text-flyfast-blue mb-8">Finalizar Compra</h1>
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//         {/* Formulário de Morada e Pagamento */}
//         <div className="lg:col-span-2">
//           <div className="card">
//             <h2 className="text-xl font-bold text-flyfast-blue mb-6">Morada de Entrega</h2>
//             <div className="space-y-4">
//               <div>
//                 <label className="label">Rua e Número</label>
//                 <input type="text" name="street" onChange={handleAddressChange} className="input-field" required />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="md:col-span-2">
//                   <label className="label">Cidade</label>
//                   <input type="text" name="city" onChange={handleAddressChange} className="input-field" required />
//                 </div>
//                 <div>
//                   <label className="label">Código Postal</label>
//                   <input type="text" name="zip" onChange={handleAddressChange} className="input-field" required />
//                 </div>
//               </div>
//               <div>
//                 <label className="label">País</label>
//                 <select name="country" onChange={handleAddressChange} className="input-field" value={address.country}>
//                   <option>Angola</option>
//                   <option>Portugal</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="card mt-8">
//             <h2 className="text-xl font-bold text-flyfast-blue mb-6">Método de Pagamento</h2>
//             <div className="space-y-4">
//               <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'paypal' ? 'border-flyfast-blue bg-blue-50' : ''}`}>
//                 <input type="radio" name="paymentMethod" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-4" />
//                 <span>Pagar com PayPal</span>
//               </label>
//             </div>
//           </div>
//         </div>

//         {/* Resumo do Pedido */}
//         <div className="lg:col-span-1">
//           <div className="card sticky top-24">
//             <h2 className="text-xl font-bold text-flyfast-blue mb-6">Resumo do Pedido</h2>
//             <div className="space-y-3 mb-6">
//               {items.map(item => (
//                 <div key={item.productId} className="flex justify-between text-sm">
//                   <span>{item.name} x {item.quantity}</span>
//                   <span className="font-medium">{(item.price * item.quantity).toLocaleString()} AOA</span>
//                 </div>
//               ))}
//             </div>
//             <div className="border-t pt-4 space-y-3">
//               <div className="flex justify-between font-bold text-lg">
//                 <span>Total</span>
//                 <span>{calculateTotal().toLocaleString()} AOA</span>
//               </div>
//             </div>
            
//             {error && (
//               <div className="alert alert-error mt-6">
//                 <FaExclamationCircle />
//                 <span>{error}</span>
//               </div>
//             )}

//             <div className="mt-8">
//               <button type="submit" className="w-full btn-primary btn-lg flex items-center justify-center" disabled={isLoading}>
//                 {isLoading ? (
//                   <FaSpinner className="animate-spin" />
//                 ) : (
//                   <>
//                     <FaLock className="mr-2" />
//                     Pagar com Segurança
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Checkout;