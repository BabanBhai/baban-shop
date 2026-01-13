import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { CartItem, Address } from '../types';
import { NeoButton } from '../components/NeoButton';
import toast from 'react-hot-toast';
import { ArrowLeft, CreditCard, Truck } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Address form state
    const [address, setAddress] = useState<Omit<Address, 'id' | 'isDefault'>>({
        name: currentUser?.displayName || '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
    });

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        if (!currentUser) return;

        try {
            const cartItems = await cartService.getCart(currentUser.uid);
            setCart(cartItems);

            if (cartItems.length === 0) {
                toast.error('Your cart is empty');
                navigate('/');
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            toast.error('Failed to load cart');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = (): boolean => {
        if (!address.name || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
            toast.error('Please fill all required fields');
            return false;
        }

        if (address.phone.length !== 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return false;
        }

        if (address.pincode.length !== 6) {
            toast.error('Please enter a valid 6-digit pincode');
            return false;
        }

        return true;
    };

    const handlePlaceOrder = async () => {
        if (!currentUser) return;

        if (!validateForm()) return;

        setLoading(true);

        try {
            const shippingAddress: Address = {
                id: Date.now().toString(),
                ...address,
                isDefault: false,
            };

            const orderId = await orderService.createOrder(
                currentUser.uid,
                cart,
                shippingAddress,
                paymentMethod
            );

            // Clear cart after successful order
            await cartService.clearCart(currentUser.uid);

            toast.success('Order placed successfully!');
            navigate(`/dashboard?order=${orderId}`);
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shippingFee = cartTotal > 500 ? 0 : 50;
    const totalAmount = cartTotal + shippingFee;

    return (
        <div className="min-h-screen bg-[#F5F5F5] py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 font-bold text-black hover:underline mb-4"
                    >
                        <ArrowLeft size={20} />
                        BACK TO SHOP
                    </button>
                    <h1 className="text-4xl font-black uppercase text-black">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white border-4 border-black shadow-neo p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Truck size={24} />
                                <h2 className="text-2xl font-black uppercase">Shipping Address</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-sm mb-2 uppercase">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={address.name}
                                        onChange={handleInputChange}
                                        className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-sm mb-2 uppercase">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={address.phone}
                                        onChange={handleInputChange}
                                        maxLength={10}
                                        className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block font-bold text-sm mb-2 uppercase">Address Line 1 *</label>
                                    <input
                                        type="text"
                                        name="addressLine1"
                                        value={address.addressLine1}
                                        onChange={handleInputChange}
                                        className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block font-bold text-sm mb-2 uppercase">Address Line 2</label>
                                    <input
                                        type="text"
                                        name="addressLine2"
                                        value={address.addressLine2}
                                        onChange={handleInputChange}
                                        className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-sm mb-2 uppercase">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={address.city}
                                        onChange={handleInputChange}
                                        className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-sm mb-2 uppercase">State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={address.state}
                                        onChange={handleInputChange}
                                        className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-sm mb-2 uppercase">Pincode *</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={address.pincode}
                                        onChange={handleInputChange}
                                        maxLength={6}
                                        className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white border-4 border-black shadow-neo p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <CreditCard size={24} />
                                <h2 className="text-2xl font-black uppercase">Payment Method</h2>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 border-2 border-black cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                        className="w-5 h-5"
                                    />
                                    <span className="font-bold">Cash on Delivery (COD)</span>
                                </label>

                                <label className="flex items-center gap-3 p-4 border-2 border-black cursor-pointer hover:bg-gray-50 opacity-50">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="razorpay"
                                        disabled
                                        className="w-5 h-5"
                                    />
                                    <span className="font-bold">Online Payment (Coming Soon)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border-4 border-black shadow-neo p-6 sticky top-4">
                            <h2 className="text-2xl font-black uppercase mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 pb-4 border-b-2 border-gray-200">
                                        <img
                                            src={item.product.imageUrl}
                                            alt={item.product.title}
                                            className="w-16 h-16 object-cover border-2 border-black"
                                        />
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-sm line-clamp-2">{item.product.title}</h4>
                                            <p className="font-mono text-sm">
                                                ${item.product.price.toFixed(2)} × {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 mb-6 font-mono">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-bold">${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span className="font-bold">{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
                                </div>
                                <div className="border-t-2 border-black pt-2 flex justify-between text-xl">
                                    <span className="font-black">TOTAL:</span>
                                    <span className="font-black">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {cartTotal > 500 && (
                                <div className="bg-green-100 border-2 border-green-600 p-3 mb-4">
                                    <p className="text-sm font-bold text-green-800">
                                        🎉 You get FREE shipping!
                                    </p>
                                </div>
                            )}

                            <NeoButton
                                className="w-full py-4 text-lg"
                                variant="black"
                                onClick={handlePlaceOrder}
                                disabled={loading}
                            >
                                {loading ? 'PLACING ORDER...' : 'PLACE ORDER'}
                            </NeoButton>

                            <p className="text-xs text-center mt-4 font-mono text-gray-600">
                                By placing your order, you agree to our terms and conditions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
