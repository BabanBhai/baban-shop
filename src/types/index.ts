export interface Product {
    id: string;
    title: string;
    description: string;
    author: string;
    authorHandle: string;
    price: number;
    tags: string[];
    imageUrl: string;
    category: string;
    createdAt: string;
    isOriginal: boolean;
    promptSnippet?: string;
    stock?: number;
    rating?: number;
    reviewCount?: number;
}

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'customer' | 'admin';
    createdAt: Date;
    addresses?: Address[];
    wishlist?: string[]; // Product IDs
}

export interface Address {
    id: string;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: 'cod' | 'razorpay' | 'stripe';
    paymentStatus: 'pending' | 'completed' | 'failed';
    shippingAddress: Address;
    createdAt: Date;
    updatedAt: Date;
    trackingNumber?: string;
}

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

export enum SortOption {
    NEWEST = 'NEWEST',
    OLDEST = 'OLDEST',
    PRICE_HIGH = 'PRICE_HIGH',
    PRICE_LOW = 'PRICE_LOW',
    RATING = 'RATING'
}
