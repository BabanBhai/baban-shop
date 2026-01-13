import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { Product, Order } from '../types';
import { NeoButton } from '../components/NeoButton';
import {
    ArrowLeft,
    Package,
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Plus,
    Edit,
    Trash2,
    Check,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
    });
    const [loading, setLoading] = useState(true);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { currentUser, isAdmin } = useAuth();
    const navigate = useNavigate();

    // New product form state
    const [newProduct, setNewProduct] = useState({
        title: '',
        description: '',
        price: 0,
        category: '',
        tags: '',
        imageUrl: '',
        stock: 0,
        author: 'Baban Official',
        authorHandle: '@BABAN',
    });

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        loadData();
    }, [isAdmin]);

    const loadData = async () => {
        try {
            const [productsData, ordersData, statsData] = await Promise.all([
                productService.getAllProducts(),
                orderService.getAllOrders(),
                orderService.getOrderStats(),
            ]);

            setProducts(productsData);
            setOrders(ordersData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading admin data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async () => {
        try {
            const productData: Omit<Product, 'id'> = {
                ...newProduct,
                tags: newProduct.tags.split(',').map(t => t.trim().toUpperCase()),
                createdAt: new Date().toISOString(),
                isOriginal: true,
            };

            await productService.addProduct(productData);
            toast.success('Product added successfully!');
            setShowAddProduct(false);
            setNewProduct({
                title: '',
                description: '',
                price: 0,
                category: '',
                tags: '',
                imageUrl: '',
                stock: 0,
                author: 'Baban Official',
                authorHandle: '@BABAN',
            });
            loadData();
        } catch (error) {
            toast.error('Failed to add product');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productService.deleteProduct(id);
            toast.success('Product deleted successfully!');
            loadData();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
        try {
            await orderService.updateOrderStatus(orderId, status);
            toast.success('Order status updated!');
            loadData();
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
                <p className="text-2xl font-black">LOADING ADMIN DASHBOARD...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 font-bold text-black hover:underline mb-4"
                    >
                        <ArrowLeft size={20} />
                        BACK TO SHOP
                    </button>
                    <h1 className="text-4xl font-black uppercase text-black mb-2">Admin Dashboard</h1>
                    <p className="font-mono text-gray-700">
                        Manage your shop, <span className="font-bold">{currentUser?.displayName}</span>
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-black uppercase border-2 border-black transition-all ${activeTab === 'overview'
                                ? 'bg-black text-white shadow-neo'
                                : 'bg-white text-black hover:shadow-neo'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-3 font-black uppercase border-2 border-black transition-all ${activeTab === 'products'
                                ? 'bg-black text-white shadow-neo'
                                : 'bg-white text-black hover:shadow-neo'
                            }`}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 font-black uppercase border-2 border-black transition-all ${activeTab === 'orders'
                                ? 'bg-black text-white shadow-neo'
                                : 'bg-white text-black hover:shadow-neo'
                            }`}
                    >
                        Orders
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white border-4 border-black shadow-neo p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Package size={32} className="text-purple-600" />
                                <TrendingUp size={24} className="text-green-600" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-600 uppercase">Total Orders</h3>
                            <p className="text-4xl font-black">{stats.totalOrders}</p>
                        </div>

                        <div className="bg-white border-4 border-black shadow-neo p-6">
                            <div className="flex items-center justify-between mb-4">
                                <DollarSign size={32} className="text-green-600" />
                                <TrendingUp size={24} className="text-green-600" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-600 uppercase">Total Revenue</h3>
                            <p className="text-4xl font-black">${stats.totalRevenue.toFixed(2)}</p>
                        </div>

                        <div className="bg-white border-4 border-black shadow-neo p-6">
                            <div className="flex items-center justify-between mb-4">
                                <ShoppingCart size={32} className="text-yellow-600" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-600 uppercase">Pending Orders</h3>
                            <p className="text-4xl font-black">{stats.pendingOrders}</p>
                        </div>

                        <div className="bg-white border-4 border-black shadow-neo p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Check size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-600 uppercase">Completed Orders</h3>
                            <p className="text-4xl font-black">{stats.completedOrders}</p>
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black uppercase">Manage Products</h2>
                            <NeoButton
                                variant="black"
                                onClick={() => setShowAddProduct(true)}
                                className="flex items-center gap-2"
                            >
                                <Plus size={20} />
                                ADD PRODUCT
                            </NeoButton>
                        </div>

                        {showAddProduct && (
                            <div className="bg-white border-4 border-black shadow-neo p-6 mb-6">
                                <h3 className="text-xl font-black uppercase mb-4">Add New Product</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Product Title"
                                        value={newProduct.title}
                                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                        className="border-2 border-black p-3 font-mono"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={newProduct.price || ''}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                                        className="border-2 border-black p-3 font-mono"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Category"
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="border-2 border-black p-3 font-mono"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Stock"
                                        value={newProduct.stock || ''}
                                        onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                                        className="border-2 border-black p-3 font-mono"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tags (comma separated)"
                                        value={newProduct.tags}
                                        onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                                        className="border-2 border-black p-3 font-mono md:col-span-2"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Image URL"
                                        value={newProduct.imageUrl}
                                        onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                                        className="border-2 border-black p-3 font-mono md:col-span-2"
                                    />
                                    <textarea
                                        placeholder="Description"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                        className="border-2 border-black p-3 font-mono md:col-span-2 h-24"
                                    />
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <NeoButton variant="black" onClick={handleAddProduct}>
                                        SAVE PRODUCT
                                    </NeoButton>
                                    <NeoButton variant="primary" onClick={() => setShowAddProduct(false)}>
                                        CANCEL
                                    </NeoButton>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white border-2 border-black shadow-neo p-4">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.title}
                                        className="w-full h-48 object-cover border-2 border-black mb-4"
                                    />
                                    <h3 className="font-black text-lg mb-2 line-clamp-2">{product.title}</h3>
                                    <p className="font-mono font-bold text-xl mb-2">${product.price.toFixed(2)}</p>
                                    <p className="text-sm text-gray-600 mb-4">Stock: {product.stock || 0}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="flex-1 bg-red-500 text-white border-2 border-black p-2 font-bold hover:bg-red-600 flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            DELETE
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div>
                        <h2 className="text-2xl font-black uppercase mb-6">Manage Orders</h2>
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white border-2 border-black shadow-neo p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-black text-lg">ORDER #{order.id.slice(0, 8).toUpperCase()}</h3>
                                            <p className="font-mono text-sm text-gray-600">
                                                Customer: {order.shippingAddress.name}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                                                className="border-2 border-black p-2 font-bold text-sm"
                                            >
                                                <option value="pending">PENDING</option>
                                                <option value="processing">PROCESSING</option>
                                                <option value="shipped">SHIPPED</option>
                                                <option value="delivered">DELIVERED</option>
                                                <option value="cancelled">CANCELLED</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="font-bold uppercase text-gray-600">Items</p>
                                            <ul className="font-mono">
                                                {order.items.map((item, idx) => (
                                                    <li key={idx}>
                                                        {item.product.title} × {item.quantity}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-bold uppercase text-gray-600">Payment</p>
                                            <p className="font-mono">{order.paymentMethod.toUpperCase()}</p>
                                            <p className="font-mono">{order.paymentStatus.toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="font-bold uppercase text-gray-600">Total</p>
                                            <p className="font-black text-2xl">${order.total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
