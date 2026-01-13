import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { NeoButton } from '../components/NeoButton';
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const UserDashboard: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        loadOrders();

        // Show success message if redirected from checkout
        const orderId = searchParams.get('order');
        if (orderId) {
            toast.success(`Order #${orderId.slice(0, 8)} placed successfully!`);
        }
    }, []);

    const loadOrders = async () => {
        if (!currentUser) return;

        try {
            const userOrders = await orderService.getUserOrders(currentUser.uid);
            setOrders(userOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return <Clock className="text-yellow-600" size={20} />;
            case 'processing':
                return <Package className="text-blue-600" size={20} />;
            case 'shipped':
                return <Truck className="text-purple-600" size={20} />;
            case 'delivered':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'cancelled':
                return <XCircle className="text-red-600" size={20} />;
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 border-yellow-600 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 border-blue-600 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 border-purple-600 text-purple-800';
            case 'delivered':
                return 'bg-green-100 border-green-600 text-green-800';
            case 'cancelled':
                return 'bg-red-100 border-red-600 text-red-800';
        }
    };

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
                    <h1 className="text-4xl font-black uppercase text-black mb-2">My Dashboard</h1>
                    <p className="font-mono text-gray-700">
                        Welcome back, <span className="font-bold">{currentUser?.displayName}</span>!
                    </p>
                </div>

                {/* User Info Card */}
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-8">
                    <h2 className="text-2xl font-black uppercase mb-4">Account Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                        <div>
                            <p className="text-sm text-gray-600 uppercase">Email</p>
                            <p className="font-bold">{currentUser?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 uppercase">Member Since</p>
                            <p className="font-bold">
                                {currentUser?.createdAt ? format(new Date(currentUser.createdAt), 'MMM dd, yyyy') : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="bg-white border-4 border-black shadow-neo p-6">
                    <h2 className="text-2xl font-black uppercase mb-6">Order History</h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="font-bold text-xl">LOADING ORDERS...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package size={64} className="mx-auto mb-4 text-gray-400" />
                            <p className="font-bold text-xl mb-4">No orders yet</p>
                            <NeoButton variant="black" onClick={() => navigate('/')}>
                                START SHOPPING
                            </NeoButton>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="border-2 border-black p-4 hover:shadow-neo transition-shadow"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                        <div>
                                            <h3 className="font-black text-lg">
                                                ORDER #{order.id.slice(0, 8).toUpperCase()}
                                            </h3>
                                            <p className="font-mono text-sm text-gray-600">
                                                {format(new Date(order.createdAt), 'MMM dd, yyyy - hh:mm a')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                                            <div
                                                className={`flex items-center gap-2 px-3 py-1 border-2 font-bold text-sm uppercase ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t-2 border-gray-200 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-600 uppercase font-bold">Items</p>
                                                <ul className="font-mono text-sm">
                                                    {order.items.map((item, idx) => (
                                                        <li key={idx}>
                                                            {item.product.title} × {item.quantity}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 uppercase font-bold">Shipping Address</p>
                                                <p className="font-mono text-sm">
                                                    {order.shippingAddress.name}<br />
                                                    {order.shippingAddress.addressLine1}<br />
                                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center border-t-2 border-gray-200 pt-4">
                                            <div>
                                                <p className="text-sm text-gray-600 uppercase">Payment Method</p>
                                                <p className="font-bold uppercase">{order.paymentMethod}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600 uppercase">Total Amount</p>
                                                <p className="font-black text-2xl">${order.total.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        {order.trackingNumber && (
                                            <div className="mt-4 bg-blue-50 border-2 border-blue-600 p-3">
                                                <p className="text-sm font-bold text-blue-800">
                                                    Tracking Number: {order.trackingNumber}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
