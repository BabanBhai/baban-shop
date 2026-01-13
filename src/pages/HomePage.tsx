import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { NeoButton } from '../components/NeoButton';
import { Product, CartItem } from '../types';
import { ShoppingBag, X, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import toast from 'react-hot-toast';

// Mock products for initial display (will be replaced with Firebase data)
const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        title: 'Retro-Tech Mechanical Keyboard',
        description: 'A 75% layout mechanical keyboard with custom dye-sub PBT keycaps. Features hot-swappable switches and a translucent retro casing.',
        author: 'MechWorks',
        authorHandle: '@MECHWORKS',
        price: 149.99,
        tags: ['TECH', 'KEYBOARD', 'RETRO'],
        imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
        category: 'Electronics',
        createdAt: 'In Stock',
        isOriginal: true,
        stock: 10,
    },
    {
        id: '2',
        title: 'Limited Edition Graphic Hoodie',
        description: 'Heavyweight cotton hoodie featuring abstract brutalist typography. Oversized fit with drop shoulders and premium ribbed cuffs.',
        author: 'Baban Official',
        authorHandle: '@BABAN',
        price: 85.00,
        tags: ['FASHION', 'STREETWEAR', 'LIMITED'],
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
        category: 'Apparel',
        createdAt: 'New Arrival',
        isOriginal: true,
        stock: 5,
    },
    {
        id: '3',
        title: 'Analog Film Camera 35mm',
        description: 'Restored vintage 35mm rangefinder camera. Perfect working condition with a sharp f/1.7 lens and manual focus mechanism.',
        author: 'VintageFinds',
        authorHandle: '@VINTAGE',
        price: 220.00,
        tags: ['PHOTO', 'VINTAGE', 'ANALOG'],
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800',
        category: 'Photography',
        createdAt: '1 left',
        isOriginal: false,
        stock: 1,
    },
    {
        id: '4',
        title: 'Industrial Desk Lamp',
        description: 'Matte black architectural desk lamp with adjustable arm. Uses standard E26 bulbs. Minimalist design suitable for modern workspaces.',
        author: 'Lumina',
        authorHandle: '@LUMINA',
        price: 65.50,
        tags: ['HOME', 'DECOR', 'MINIMAL'],
        imageUrl: 'https://images.unsplash.com/photo-1534073828943-f801091a7d58?auto=format&fit=crop&q=80&w=800',
        category: 'Home',
        createdAt: 'In Stock',
        isOriginal: false,
        stock: 15,
    },
    {
        id: '5',
        title: 'Ceramic Pour-Over Set',
        description: 'Handcrafted ceramic coffee dripper with matching carafe. Speckled white glaze finish. Designed for the perfect bloom.',
        author: 'ClayCo',
        authorHandle: '@CLAYCO',
        price: 45.00,
        tags: ['KITCHEN', 'COFFEE', 'HANDMADE'],
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
        category: 'Kitchen',
        createdAt: 'Restocked',
        isOriginal: true,
        stock: 8,
    },
    {
        id: '6',
        title: 'Wireless Noise Cancelling Headphones',
        description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and plush memory foam earcups.',
        author: 'SonicBoom',
        authorHandle: '@SONIC',
        price: 299.00,
        tags: ['AUDIO', 'TECH', 'WIRELESS'],
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
        category: 'Electronics',
        createdAt: 'Best Seller',
        isOriginal: false,
        stock: 12,
    }
];

export const HomePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Get unique categories
    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    // Load products from Firebase
    useEffect(() => {
        loadProducts();
    }, []);

    // Load cart from Firebase if user is logged in
    useEffect(() => {
        if (currentUser) {
            loadCart();
        } else {
            // Load cart from localStorage for guest users
            const savedCart = localStorage.getItem('guestCart');
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        }
    }, [currentUser]);

    const loadProducts = async () => {
        try {
            const fetchedProducts = await productService.getAllProducts();
            if (fetchedProducts.length > 0) {
                setProducts(fetchedProducts);
                setFilteredProducts(fetchedProducts);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            // Keep using mock products if Firebase fails
        }
    };

    const loadCart = async () => {
        if (!currentUser) return;

        try {
            const cartItems = await cartService.getCart(currentUser.uid);
            setCart(cartItems);
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const handleSearch = (term: string) => {
        if (!term.trim()) {
            applyFilters(products, selectedCategory);
            return;
        }
        const lowerTerm = term.toLowerCase();
        let filtered = products.filter(p =>
            p.title.toLowerCase().includes(lowerTerm) ||
            p.description.toLowerCase().includes(lowerTerm) ||
            p.tags.some(tag => tag.toLowerCase().includes(lowerTerm))
        );

        // Apply category filter to search results
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        setFilteredProducts(filtered);
    };

    const applyFilters = (productList: Product[], category: string) => {
        let filtered = productList;

        if (category !== 'All') {
            filtered = filtered.filter(p => p.category === category);
        }

        setFilteredProducts(filtered);
    };

    const handleCategoryFilter = (category: string) => {
        setSelectedCategory(category);
        applyFilters(products, category);
        setIsFilterOpen(false);
    };

    const addToCart = async (product: Product) => {
        if (currentUser) {
            // Logged in user - save to Firebase
            try {
                await cartService.addToCart(currentUser.uid, product, 1);
                await loadCart();
                toast.success('Added to cart!');
                setIsCartOpen(true);
            } catch (error) {
                toast.error('Failed to add to cart');
            }
        } else {
            // Guest user - save to localStorage
            const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
            let newCart: CartItem[];

            if (existingItemIndex > -1) {
                newCart = [...cart];
                newCart[existingItemIndex].quantity += 1;
            } else {
                newCart = [...cart, { product, quantity: 1 }];
            }

            setCart(newCart);
            localStorage.setItem('guestCart', JSON.stringify(newCart));
            toast.success('Added to cart!');
            setIsCartOpen(true);
        }
    };

    const removeFromCart = async (productId: string) => {
        if (currentUser) {
            try {
                await cartService.removeFromCart(currentUser.uid, productId);
                await loadCart();
            } catch (error) {
                toast.error('Failed to remove item');
            }
        } else {
            const newCart = cart.filter(item => item.product.id !== productId);
            setCart(newCart);
            localStorage.setItem('guestCart', JSON.stringify(newCart));
        }
    };

    const handleCheckout = () => {
        if (!currentUser) {
            toast.error('Please login to checkout');
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen font-sans bg-[#F5F5F5] pb-20 relative">
            <Header onSearch={handleSearch} />

            {/* Stats Bar */}
            <div className="bg-white border-b-4 border-black sticky top-0 z-40 shadow-sm">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-black">Available Items</h2>
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="border-2 border-black p-1 hover:bg-gray-100 cursor-pointer transition-colors text-black flex items-center gap-2 px-3"
                            >
                                <Filter size={20} />
                                <span className="font-bold text-sm">{selectedCategory}</span>
                            </button>

                            {isFilterOpen && (
                                <div className="absolute top-full left-0 mt-2 bg-white border-2 border-black shadow-neo z-50 min-w-[200px]">
                                    {categories.map((category: string) => (
                                        <button
                                            key={category}
                                            onClick={() => handleCategoryFilter(category)}
                                            className={`w-full px-4 py-2 text-left font-bold hover:bg-gray-100 transition-colors ${selectedCategory === category ? 'bg-yellow-300' : ''
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Cart Trigger */}
                        <button
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            className="relative bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-2 px-4 text-black"
                        >
                            <ShoppingBag size={20} />
                            <span className="font-bold">CART</span>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white border-2 border-black w-6 h-6 flex items-center justify-center font-bold text-xs rounded-full">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={addToCart}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-2xl font-black text-black uppercase">No Items Found</h3>
                    </div>
                )}
            </main>

            {/* Cart Sidebar */}
            {isCartOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsCartOpen(false)} />
                    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l-4 border-black z-50 flex flex-col shadow-[-10px_0px_20px_rgba(0,0,0,0.2)]">
                        <div className="p-6 border-b-4 border-black flex justify-between items-center bg-yellow-300">
                            <h2 className="text-2xl font-black uppercase text-black">Your Stash</h2>
                            <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform text-black">
                                <X size={32} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 space-y-4">
                            {cart.length === 0 ? (
                                <div className="text-center font-mono text-black font-bold mt-10">
                                    Your cart is empty. <br /> Go find some exclusive gear!
                                </div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={`${item.product.id}-${idx}`} className="border-2 border-black p-4 shadow-neo flex gap-4 bg-white">
                                        <img src={item.product.imageUrl} className="w-16 h-16 object-cover border-2 border-black" alt="" />
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-sm leading-tight line-clamp-2 text-black">{item.product.title}</h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-mono font-bold text-black">${item.product.price.toFixed(2)} x {item.quantity}</span>
                                                <button
                                                    onClick={() => removeFromCart(item.product.id)}
                                                    className="text-xs underline text-red-600 hover:text-red-800 font-bold"
                                                >
                                                    REMOVE
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t-4 border-black bg-gray-50">
                            <div className="flex justify-between font-black text-xl mb-4 font-mono text-black">
                                <span>TOTAL</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <NeoButton
                                className="w-full py-4 text-lg"
                                variant="black"
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                            >
                                CHECKOUT
                            </NeoButton>
                        </div>
                    </div>
                </>
            )}

            {/* Footer */}
            <footer className="mt-20 border-t-4 border-black bg-white py-12 text-center">
                <p className="font-mono text-sm text-black font-black">
                    BABAN'S SHOP EXCLUSIVE © 2025
                </p>
            </footer>
        </div>
    );
};
