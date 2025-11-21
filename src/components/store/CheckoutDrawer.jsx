// src/components/store/CheckoutDrawer.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShoppingCart, Trash2, ArrowRight, ArrowLeft, 
  User, Truck, CreditCard, CheckCircle, Loader2, Minus, Plus 
} from 'lucide-react';
import { 
  addDoc, collection, serverTimestamp, doc, 
  writeBatch 
} from 'firebase/firestore';

import { useCart } from '../../contexts/CartContext.jsx';
import { Input } from '../../Forminput.jsx';
import { ProductImage } from '../../ProductImage.jsx';
import { CURRENCY_CODE } from '../../config.js';

// --- Helper Component: Step Indicator ---
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, title: 'Details', icon: User },
    { num: 2, title: 'Delivery', icon: Truck },
    { num: 3, title: 'Review', icon: CreditCard },
  ];

  return (
    <nav className="flex items-center justify-between px-6 pt-5">
      {steps.map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                currentStep === step.num
                  ? 'bg-primary-700 border-primary-700 text-white'
                  : currentStep > step.num
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {currentStep > step.num ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
            </div>
            <p
              className={`mt-1.5 text-xs font-semibold ${
                currentStep === step.num ? 'text-primary-700' : 'text-gray-500'
              }`}
            >
              {step.title}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-2 bg-gray-200"></div>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// --- Helper Component: Animated Step Wrapper ---
const CheckoutStep = ({ stepKey, children }) => {
  const variants = {
    enter: { x: '100%', opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  };

  return (
    <motion.div
      key={stepKey}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-6 overflow-y-auto"
    >
      {children}
    </motion.div>
  );
};


export function CheckoutDrawer({
  isOpen,
  onClose,
  store,
  products,
  db,
  showError,
  showSuccess,
  sendSystemNotification,
}) {
  // Ensure store exists before calling hooks that depend on it
  const storeId = store?.id;
  const { cart, clearCart, getTotalPrice, getItemCount, removeFromCart, updateQuantity } = useCart(storeId);
  
  // --- SAFETY CHECK: Convert cart object to array safely ---
  const cartItems = cart ? Object.values(cart) : [];
  const cartTotal = getTotalPrice ? parseFloat(getTotalPrice()) : 0;
  const cartCount = getItemCount ? getItemCount() : 0;

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [step, setStep] = useState(1);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGovernorate, setCustomerGovernorate] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // Default to COD

  const governorates = [
    'Amman', 'Irbid', 'Zarqa', 'Balqa', 'Mafraq', 'Karak', 
    'Jerash', 'Madaba', 'Ajloun', 'Aqaba', 'Ma\'an', 'Tafilah'
  ];

  const canGoToStep2 = customerName.trim() !== '' && customerPhone.trim() !== '' && customerPhone.length >= 7;
  const canGoToStep3 = canGoToStep2 && customerAddress.trim() !== '' && customerGovernorate !== '';

  const currentPlanId = store?.planId || 'free';
  const themeColor = store?.themeColor || '#6D28D9';

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setCustomerGovernorate('');
        setCustomerNotes('');
        setOrderPlaced(false);
        setLoading(false);
        setStep(1);
        setPaymentMethod('COD');
      }, 300);
    }
  }, [isOpen]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (loading || !canGoToStep3) return;
    setLoading(true);

    try {
      const orderData = {
        storeId: store.id,
        items: cartItems,
        total: cartTotal,
        status: 'PENDING',
        paymentMethod: paymentMethod,
        customerName: customerName,      // Add these top-level fields for OrderList compatibility
        customerPhone: customerPhone,    // Add these top-level fields for OrderList compatibility
        customerAddress: `${customerAddress}, ${customerGovernorate}`, // Add these top-level fields for OrderList compatibility
        customer: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
          governorate: customerGovernorate,
          notes: customerNotes,
        },
        createdAt: serverTimestamp(),
      };

      const batch = writeBatch(db);
      
      // Use the products prop if available to update stock, otherwise skip strict checking for now
      if (products) {
          for (const item of cartItems) {
            const productDoc = products.find(p => p.id === item.id);
            if (productDoc) {
                const productRef = doc(db, 'stores', store.id, 'products', item.id);
                const newStock = (productDoc.stock || 0) - item.quantity;
                if (newStock >= 0) {
                     batch.update(productRef, { stock: newStock });
                }
            }
          }
      }
      
      const ordersRef = collection(db, 'stores', store.id, 'orders');
      await addDoc(ordersRef, orderData);
      await batch.commit();

      sendSystemNotification(
        store.id,
        store.email,
        currentPlanId,
        'new_order',
        `New Order! You have a new order (#${Date.now().toString().slice(-6)}) for ${CURRENCY_CODE} ${cartTotal} from ${customerName}.`
      );

      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error('Order placement error:', error);
      showError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
   if (orderPlaced) {
      const orderItemsText = cartItems.map(item => `${item.quantity} x ${item.name}`).join("\n");
      const paymentInfo = paymentMethod === 'CLIQ' ? "I have paid via CLIQ." : "I will pay with Cash on Delivery (COD).";
      const message = `Hi ${store.name}! I just placed an order on your store.\n\nMy Details:\nName: ${customerName}\nPhone: ${customerPhone}\nAddress: ${customerAddress}, ${customerGovernorate}\n\nOrder:\n${orderItemsText}\n\nTotal: ${CURRENCY_CODE} ${cartTotal}\nPayment: ${paymentInfo}\n\nThank you!`;
      const whatsappUrl = `https://wa.me/${store.phone}?text=${encodeURIComponent(message)}`;

      return (
        <div className="p-6 flex flex-col items-center justify-center text-center h-full">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Thank you, {customerName}!</h2>
          <p className="text-gray-600 mt-2 mb-6">Your order has been sent to <strong>{store.name}</strong>.</p>

          {store.phone && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
              style={{ backgroundColor: '#25D366', color: 'white', borderColor: '#25D366' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.018.265 1.956.741 2.76l-1.004 3.654 3.736-1.025a5.726 5.726 0 0 0 2.294.588c3.181 0 5.767-2.586 5.767-5.767s-2.586-5.767-5.767-5.767m0-2c4.298 0 7.767 3.469 7.767 7.767 0 2.062-.804 3.935-2.122 5.35l1.625 5.92-5.701-1.56a7.683 7.683 0 0 1-3.57 1.023c-4.298 0-7.767-3.469-7.767-7.767s3.469-7.767 7.767-7.767m.001 11.023c-.326 0-.651-.055-.96-.162l-.066-.04-4.57 1.253 1.27-4.43-.054-.078a6.11 6.11 0 0 1-1.05-3.238c0-3.353 2.719-6.071 6.071-6.071s6.071 2.719 6.071 6.071c0 3.353-2.719 6.071-6.071 6.071m4.31-5.01c-.244-.123-1.44-.71-1.664-.79-.224-.08-.386-.123-.548.123-.162.245-.63 1.017-.772 1.218-.142.2-.284.228-.528.104-.244-.123-.927-.35-1.767-1.089-.655-.578-1.096-1.29-1.222-1.514-.127-.224-.014-.347.108-.47s.244-.284.366-.426c.122-.142.162-.245.244-.407.081-.162.04-.304-.02-.426-.061-.123-.548-1.318-.75-1.805-.196-.47-.393-.406-.548-.406h-.47c-.162 0-.426.061-.65.305-.224.245-.863.84-1.005 2.041-.142 1.2.147 2.921 1.005 4.39 1.129 1.93 2.298 3.322 4.49 4.491.528.284 1.229.39 1.83.39.81 0 1.503-.212 2.01-.73.558-.568.863-1.29.985-2.041.122-.75.061-1.18-.082-1.303s-.408-.188-.65-.31z"/></svg>
              Confirm on WhatsApp
            </a>
          )}

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-left w-full">
            <h4 className="font-semibold text-gray-800">What's Next?</h4>
            <p className="text-sm text-gray-600 mt-1">
              {store.phone 
                ? "Click the button above to send your details. We'll confirm delivery shortly."
                : `We will contact you at ${customerPhone} to confirm your order.`
              }
            </p>
          </div>
          <button onClick={onClose} className="btn-secondary w-full mt-4">Close</button>
        </div>
      );
    }

    if (cartCount === 0) {
      return (
        <div className="p-6 flex flex-col items-center justify-center text-center h-full">
          <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
          <p className="text-gray-600 mt-2 mb-6">Add items to get started.</p>
          <button onClick={onClose} className="btn-primary w-full">Start Shopping</button>
        </div>
      );
    }

    return (
      <form onSubmit={handlePlaceOrder} className="flex flex-col h-full">
        <StepIndicator currentStep={step} />
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <CheckoutStep stepKey={1}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Details</h3>
                <div className="space-y-4">
                  <Input label="Full Name" value={customerName} onChange={setCustomerName} required placeholder="e.g. Ahmad Ali" />
                  <Input label="Phone Number" type="tel" value={customerPhone} onChange={setCustomerPhone} required placeholder="079 123 4567" />
                </div>
              </CheckoutStep>
            )}
            {step === 2 && (
              <CheckoutStep stepKey={2}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Governorate</label>
                    <select
                      value={customerGovernorate}
                      onChange={(e) => setCustomerGovernorate(e.target.value)}
                      required
                      className="input w-full"
                    >
                      <option value="">Select...</option>
                      {governorates.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                    </select>
                  </div>
                  <Input label="Address Details" value={customerAddress} onChange={setCustomerAddress} required placeholder="Street, Building, Apartment" />
                  <Input label="Notes (Optional)" value={customerNotes} onChange={setCustomerNotes} placeholder="Special instructions..." />
                </div>
              </CheckoutStep>
            )}
            {step === 3 && (
              <CheckoutStep stepKey={3}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Order</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-4">
                   {cartItems.map(item => (
                       <div key={item.id} className="flex justify-between text-sm">
                           <span>{item.quantity}x {item.name}</span>
                           <span className="font-medium">${CURRENCY_CODE} {(item.price * item.quantity).toFixed(2)}</span>
                       </div>
                   ))}
                   <div className="border-t pt-2 flex justify-between font-bold text-lg">
                       <span>Total</span>
                       <span> ${CURRENCY_CODE} {cartTotal}</span>
                   </div>
                </div>
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Payment Method</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setPaymentMethod('COD')} className={`p-3 border rounded-lg text-sm font-medium ${paymentMethod === 'COD' ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600' : 'hover:bg-gray-50'}`}>
                            Cash on Delivery
                        </button>
                        <button type="button" onClick={() => setPaymentMethod('CLIQ')} className={`p-3 border rounded-lg text-sm font-medium ${paymentMethod === 'CLIQ' ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600' : 'hover:bg-gray-50'}`}>
                            CLIQ Transfer
                        </button>
                    </div>
                </div>
              </CheckoutStep>
            )}
          </AnimatePresence>
        </div>
        <div className="p-6 border-t border-gray-200 bg-white flex gap-3">
          {step > 1 && <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">Back</button>}
          {step < 3 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} disabled={step === 1 ? !canGoToStep2 : !canGoToStep3} className="btn-primary flex-1">Next <ArrowRight className="w-4 h-4 ml-2" /></button>
          ) : (
            <button type="submit" disabled={loading} className="btn-primary flex-1" style={{ backgroundColor: themeColor }}>{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Place Order (${CURRENCY_CODE} ${cartTotal})`}</button>
          )}
        </div>
      </form>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <ShoppingCart className="w-5 h-5" /> Checkout
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"><X className="w-6 h-6" /></button>
        </div>
        {renderContent()}
      </motion.div>
    </>
  );
}