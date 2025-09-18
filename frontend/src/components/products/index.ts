// Product Components Export Index
// Centralized exports for all eco-products components

// Core Product Components
export { default as ProductCard } from './ProductCard';
export { default as ProductList } from './ProductList';
export { default as ProductFilters } from './ProductFilters';
export { default as ProductDetail } from './ProductDetail';
export { default as ShoppingCart } from './ShoppingCart';

// Re-export types for convenience
export type { ProductListItem, Product, ShoppingCart as ShoppingCartType, CartItem } from '../../types/products';
