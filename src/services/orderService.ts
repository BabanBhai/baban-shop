import { supabase, isSupabaseConfigured } from '../config/supabase.config';
import { Order, CartItem, Address } from '../types';

export const orderService = {
    // Create new order
    async createOrder(
        userId: string,
        items: CartItem[],
        shippingAddress: Address,
        paymentMethod: string
    ): Promise<string> {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }

        try {
            const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

            const { data, error } = await supabase
                .from('orders')
                .insert({
                    user_id: userId,
                    items: items.map(item => ({
                        productId: item.productId,
                        title: item.product.title,
                        price: item.product.price,
                        quantity: item.quantity,
                        imageUrl: item.product.imageUrl,
                    })),
                    total_amount: totalAmount,
                    shipping_address: shippingAddress,
                    payment_method: paymentMethod,
                    status: 'pending',
                    is_paid: paymentMethod !== 'cod', // COD is not paid initially
                })
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('Failed to create order');

            return data.id;
        } catch (error: any) {
            console.error('Error creating order:', error);
            throw new Error(error.message || 'Failed to create order');
        }
    },

    // Get order by ID
    async getOrderById(orderId: string): Promise<Order | null> {
        if (!isSupabaseConfigured || !supabase) {
            return null;
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (error) throw error;
            if (!data) return null;

            return {
                id: data.id,
                userId: data.user_id,
                items: data.items,
                totalAmount: parseFloat(data.total_amount),
                shippingAddress: data.shipping_address,
                paymentMethod: data.payment_method,
                status: data.status,
                isPaid: data.is_paid,
                createdAt: new Date(data.created_at),
            };
        } catch (error) {
            console.error('Error fetching order:', error);
            return null;
        }
    },

    // Get orders for a specific user
    async getUserOrders(userId: string): Promise<Order[]> {
        if (!isSupabaseConfigured || !supabase) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(order => ({
                id: order.id,
                userId: order.user_id,
                items: order.items,
                totalAmount: parseFloat(order.total_amount),
                shippingAddress: order.shipping_address,
                paymentMethod: order.payment_method,
                status: order.status,
                isPaid: order.is_paid,
                createdAt: new Date(order.created_at),
            }));
        } catch (error) {
            console.error('Error fetching user orders:', error);
            return [];
        }
    },

    // Get all orders (Admin only)
    async getAllOrders(): Promise<Order[]> {
        if (!isSupabaseConfigured || !supabase) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(order => ({
                id: order.id,
                userId: order.user_id,
                items: order.items,
                totalAmount: parseFloat(order.total_amount),
                shippingAddress: order.shipping_address,
                paymentMethod: order.payment_method,
                status: order.status,
                isPaid: order.is_paid,
                createdAt: new Date(order.created_at),
            }));
        } catch (error) {
            console.error('Error fetching all orders:', error);
            return [];
        }
    },

    // Update order status (Admin only)
    async updateOrderStatus(orderId: string, status: string): Promise<void> {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error updating order status:', error);
            throw new Error(error.message || 'Failed to update order status');
        }
    },

    // Update payment status (Admin only)
    async updatePaymentStatus(orderId: string, isPaid: boolean): Promise<void> {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }

        try {
            const { error } = await supabase
                .from('orders')
                .update({ is_paid: isPaid })
                .eq('id', orderId);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error updating payment status:', error);
            throw new Error(error.message || 'Failed to update payment status');
        }
    },

    // Get order statistics (Admin only)
    async getOrderStats(): Promise<{
        totalOrders: number;
        totalRevenue: number;
        pendingOrders: number;
        completedOrders: number;
    }> {
        if (!isSupabaseConfigured || !supabase) {
            return {
                totalOrders: 0,
                totalRevenue: 0,
                pendingOrders: 0,
                completedOrders: 0,
            };
        }

        try {
            // Get all orders
            const { data: allOrders, error: allError } = await supabase
                .from('orders')
                .select('total_amount, status, is_paid');

            if (allError) throw allError;

            const orders = allOrders || [];

            // Calculate statistics
            const totalOrders = orders.length;
            const totalRevenue = orders
                .filter(o => o.is_paid)
                .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
            const pendingOrders = orders.filter(o => o.status === 'pending').length;
            const completedOrders = orders.filter(o => o.status === 'delivered').length;

            return {
                totalOrders,
                totalRevenue,
                pendingOrders,
                completedOrders,
            };
        } catch (error) {
            console.error('Error fetching order stats:', error);
            return {
                totalOrders: 0,
                totalRevenue: 0,
                pendingOrders: 0,
                completedOrders: 0,
            };
        }
    },
};
