import { supabase, isSupabaseConfigured } from '../config/supabase.config';
import { CartItem, Product } from '../types';

const CART_STORAGE_KEY = 'guest_cart';

export const cartService = {
    // Get cart for current user or from localStorage for guests
    async getCart(userId: string | null): Promise<CartItem[]> {
        if (!userId) {
            // Guest user - use localStorage
            return this.getGuestCart();
        }

        if (!isSupabaseConfigured || !supabase) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('carts')
                .select(`
                    *,
                    products (*)
                `)
                .eq('user_id', userId);

            if (error) throw error;

            return (data || []).map(item => ({
                id: item.id,
                productId: item.product_id,
                quantity: item.quantity,
                product: {
                    id: item.products.id,
                    title: item.products.title,
                    description: item.products.description,
                    price: parseFloat(item.products.price),
                    imageUrl: item.products.image_url,
                    category: item.products.category,
                    tags: item.products.tags || [],
                    stock: item.products.stock || 0,
                },
            }));
        } catch (error) {
            console.error('Error fetching cart:', error);
            return [];
        }
    },

    // Add item to cart
    async addToCart(userId: string | null, product: Product, quantity: number = 1): Promise<void> {
        if (!userId) {
            // Guest user - use localStorage
            this.addToGuestCart(product, quantity);
            return;
        }

        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }

        try {
            // Check if item already exists in cart
            const { data: existing } = await supabase
                .from('carts')
                .select('*')
                .eq('user_id', userId)
                .eq('product_id', product.id)
                .single();

            if (existing) {
                // Update quantity
                const { error } = await supabase
                    .from('carts')
                    .update({ quantity: existing.quantity + quantity })
                    .eq('id', existing.id);

                if (error) throw error;
            } else {
                // Insert new item
                const { error } = await supabase
                    .from('carts')
                    .insert({
                        user_id: userId,
                        product_id: product.id,
                        quantity,
                    });

                if (error) throw error;
            }
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            throw new Error(error.message || 'Failed to add to cart');
        }
    },

    // Update cart item quantity
    async updateCartItem(userId: string | null, productId: string, quantity: number): Promise<void> {
        if (!userId) {
            // Guest user - use localStorage
            this.updateGuestCartItem(productId, quantity);
            return;
        }

        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }

        try {
            if (quantity <= 0) {
                await this.removeFromCart(userId, productId);
                return;
            }

            const { error } = await supabase
                .from('carts')
                .update({ quantity })
                .eq('user_id', userId)
                .eq('product_id', productId);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error updating cart item:', error);
            throw new Error(error.message || 'Failed to update cart item');
        }
    },

    // Remove item from cart
    async removeFromCart(userId: string | null, productId: string): Promise<void> {
        if (!userId) {
            // Guest user - use localStorage
            this.removeFromGuestCart(productId);
            return;
        }

        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }

        try {
            const { error } = await supabase
                .from('carts')
                .delete()
                .eq('user_id', userId)
                .eq('product_id', productId);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error removing from cart:', error);
            throw new Error(error.message || 'Failed to remove from cart');
        }
    },

    // Clear entire cart
    async clearCart(userId: string | null): Promise<void> {
        if (!userId) {
            // Guest user - use localStorage
            localStorage.removeItem(CART_STORAGE_KEY);
            return;
        }

        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }

        try {
            const { error } = await supabase
                .from('carts')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error clearing cart:', error);
            throw new Error(error.message || 'Failed to clear cart');
        }
    },

    // Calculate cart total
    calculateCartTotal(cartItems: CartItem[]): number {
        return cartItems.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    },

    // Guest cart helpers (localStorage)
    getGuestCart(): CartItem[] {
        try {
            const cart = localStorage.getItem(CART_STORAGE_KEY);
            return cart ? JSON.parse(cart) : [];
        } catch (error) {
            console.error('Error reading guest cart:', error);
            return [];
        }
    },

    addToGuestCart(product: Product, quantity: number): void {
        try {
            const cart = this.getGuestCart();
            const existingIndex = cart.findIndex(item => item.productId === product.id);

            if (existingIndex >= 0) {
                cart[existingIndex].quantity += quantity;
            } else {
                cart.push({
                    id: `guest-${Date.now()}`,
                    productId: product.id,
                    quantity,
                    product,
                });
            }

            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error('Error adding to guest cart:', error);
        }
    },

    updateGuestCartItem(productId: string, quantity: number): void {
        try {
            let cart = this.getGuestCart();

            if (quantity <= 0) {
                cart = cart.filter(item => item.productId !== productId);
            } else {
                const index = cart.findIndex(item => item.productId === productId);
                if (index >= 0) {
                    cart[index].quantity = quantity;
                }
            }

            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error('Error updating guest cart:', error);
        }
    },

    removeFromGuestCart(productId: string): void {
        try {
            const cart = this.getGuestCart().filter(item => item.productId !== productId);
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error('Error removing from guest cart:', error);
        }
    },
};
