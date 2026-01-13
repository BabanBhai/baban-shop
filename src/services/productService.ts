import { supabase, isSupabaseConfigured } from '../config/supabase.config';
import { Product } from '../types';

export const productService = {
    // Get all products
    async getAllProducts(): Promise<Product[]> {
        // Return empty array if Supabase is not configured
        if (!isSupabaseConfigured || !supabase) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(product => ({
                id: product.id,
                title: product.title,
                description: product.description,
                price: parseFloat(product.price),
                imageUrl: product.image_url,
                category: product.category,
                tags: product.tags || [],
                stock: product.stock || 0,
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    },

    // Get product by ID
    async getProductById(id: string): Promise<Product | null> {
        if (!isSupabaseConfigured || !supabase) {
            return null;
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) return null;

            return {
                id: data.id,
                title: data.title,
                description: data.description,
                price: parseFloat(data.price),
                imageUrl: data.image_url,
                category: data.category,
                tags: data.tags || [],
                stock: data.stock || 0,
            };
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    },

    // Get products by category
    async getProductsByCategory(category: string): Promise<Product[]> {
        if (!isSupabaseConfigured || !supabase) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', category)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(product => ({
                id: product.id,
                title: product.title,
                description: product.description,
                price: parseFloat(product.price),
                imageUrl: product.image_url,
                category: product.category,
                tags: product.tags || [],
                stock: product.stock || 0,
            }));
        } catch (error) {
            console.error('Error fetching products by category:', error);
            return [];
        }
    },

    // Search products
    async searchProducts(searchTerm: string): Promise<Product[]> {
        if (!isSupabaseConfigured || !supabase) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

            if (error) throw error;

            return (data || []).map(product => ({
                id: product.id,
                title: product.title,
                description: product.description,
                price: parseFloat(product.price),
                imageUrl: product.image_url,
                category: product.category,
                tags: product.tags || [],
                stock: product.stock || 0,
            }));
        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    },

    // Add new product (Admin only)
    async addProduct(productData: Omit<Product, 'id'>): Promise<string> {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }

        try {
            const { data, error } = await supabase
                .from('products')
                .insert({
                    title: productData.title,
                    description: productData.description,
                    price: productData.price,
                    image_url: productData.imageUrl,
                    category: productData.category,
                    tags: productData.tags,
                    stock: productData.stock || 0,
                })
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('Failed to create product');

            return data.id;
        } catch (error: any) {
            console.error('Error adding product:', error);
            throw new Error(error.message || 'Failed to add product');
        }
    },

    // Update product (Admin only)
    async updateProduct(id: string, productData: Partial<Product>): Promise<void> {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }

        try {
            const updateData: any = {};
            if (productData.title !== undefined) updateData.title = productData.title;
            if (productData.description !== undefined) updateData.description = productData.description;
            if (productData.price !== undefined) updateData.price = productData.price;
            if (productData.imageUrl !== undefined) updateData.image_url = productData.imageUrl;
            if (productData.category !== undefined) updateData.category = productData.category;
            if (productData.tags !== undefined) updateData.tags = productData.tags;
            if (productData.stock !== undefined) updateData.stock = productData.stock;

            const { error } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error updating product:', error);
            throw new Error(error.message || 'Failed to update product');
        }
    },

    // Delete product (Admin only)
    async deleteProduct(id: string): Promise<void> {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error deleting product:', error);
            throw new Error(error.message || 'Failed to delete product');
        }
    },

    // Upload product image to Supabase Storage
    async uploadProductImage(file: File, productId: string): Promise<string> {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${productId}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error: any) {
            console.error('Error uploading image:', error);
            throw new Error(error.message || 'Failed to upload image');
        }
    },

    // Delete product image from Supabase Storage
    async deleteProductImage(imageUrl: string): Promise<void> {
        if (!isSupabaseConfigured || !supabase) {
            return;
        }

        try {
            // Extract file path from URL
            const urlParts = imageUrl.split('/products/');
            if (urlParts.length < 2) return;

            const filePath = urlParts[1];

            const { error } = await supabase.storage
                .from('products')
                .remove([filePath]);

            if (error) {
                console.error('Error deleting image:', error);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            // Don't throw error if image doesn't exist
        }
    },
};
