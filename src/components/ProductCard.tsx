import React from 'react';
import { Product } from '../types';
import { ShoppingCart, Star } from 'lucide-react';
import { NeoButton } from './NeoButton';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white border-[3px] border-black shadow-neo-lg flex flex-col h-full relative group hover:translate-y-[-2px] hover:shadow-neo-xl transition-all duration-200">

      {/* Header Tags */}
      <div className="flex justify-between items-start p-0 absolute -top-[18px] left-0 right-0 px-4 z-10">
        <div className="bg-white border-2 border-black px-2 py-1 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
          ITEM
        </div>
        <div className="bg-yellow-300 border-2 border-black px-2 py-1 font-bold text-xs flex items-center gap-1 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
          <Star size={12} /> Baban's Choice
        </div>
      </div>

      <div className="p-5 flex flex-col h-full mt-2">
        {/* Category Badge */}
        <div className="flex justify-end items-baseline mb-3">
          <span className="text-black text-xs font-bold border-2 border-black px-2 py-1 bg-white shadow-neo">{product.category.toUpperCase()}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black leading-tight mb-4 min-h-[3rem] line-clamp-2 text-black">
          {product.title}
        </h3>

        {/* Image Preview */}
        <div className="w-full aspect-square border-2 border-black rounded-sm mb-4 overflow-hidden relative">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
          />
          <div className="absolute bottom-2 right-2 bg-white border-2 border-black px-2 py-0.5 font-bold text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
            ${product.price.toFixed(2)}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm font-bold text-black mb-6 line-clamp-4 flex-grow leading-relaxed">
          {product.description}
        </p>

        {/* Action Area */}
        <div className="mt-auto pt-2 border-t-2 border-black">
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] font-black bg-white px-2 py-1 rounded border border-black text-black">{tag}</span>
            ))}
          </div>

          <NeoButton onClick={() => onAddToCart(product)} className="w-full py-3" variant="black">
            <ShoppingCart size={16} /> ADD TO CART
          </NeoButton>
        </div>
      </div>
    </div>
  );
};