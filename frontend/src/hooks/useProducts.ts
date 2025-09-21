import { useCallback } from 'react';
import { productsApi } from '../services/api';
import { useApi, usePaginatedApi, useOptimistic } from './useApi';
import type {
  Product,
  ProductListItem,
  SMEVendor,
  ProductCategory,
  Order,
  ProductReview,
  ShoppingCart,
  CartItem,
  AddToCartData,
  ProductSearchParams,
  OrderCreateData,
  ReviewCreateData,
} from '../types/products';

export const useProducts = () => {
  // Products
  const productsListApi = usePaginatedApi(productsApi.getProducts);
  const featuredProductsApi = useApi(productsApi.getFeaturedProducts);
  const productDetailApi = useApi(productsApi.getProduct);
  const searchProductsApi = usePaginatedApi(productsApi.searchProducts);
  const recommendationsApi = useApi(productsApi.getProductRecommendations);

  // Vendors
  const vendorsApi = usePaginatedApi(productsApi.getVendors);
  const vendorDetailApi = useApi(productsApi.getVendor);
  const vendorProductsApi = usePaginatedApi(productsApi.getProductsByVendor);

  // Categories
  const categoriesApi = useApi(productsApi.getProductCategories, { immediate: true });
  const categoryProductsApi = usePaginatedApi(productsApi.getProductsByCategory);

  // Shopping cart
  const cartApi = useApi(productsApi.getCart);
  const addToCartApi = useApi(productsApi.addToCart, {
    onSuccess: () => {
      cartApi.execute();
    },
  });
  const updateCartApi = useApi(productsApi.updateCartItem, {
    onSuccess: () => {
      cartApi.execute();
    },
  });
  const removeFromCartApi = useApi(productsApi.removeFromCart, {
    onSuccess: () => {
      cartApi.execute();
    },
  });
  const clearCartApi = useApi(productsApi.clearCart, {
    onSuccess: () => {
      cartApi.execute();
    },
  });

  // Orders
  const ordersApi = usePaginatedApi(productsApi.getOrders);
  const orderDetailApi = useApi(productsApi.getOrder);
  const createOrderApi = useApi(productsApi.createOrder, {
    onSuccess: () => {
      ordersApi.refresh();
      cartApi.execute(); // Refresh cart as it might be cleared
    },
  });

  // Reviews
  const reviewsApi = usePaginatedApi(productsApi.getProductReviews);
  const createReviewApi = useApi(productsApi.createReview, {
    onSuccess: () => {
      reviewsApi.refresh();
      // Refresh product detail if available
      if (productDetailApi.data) {
        productDetailApi.execute(productDetailApi.data.id);
      }
    },
  });

  // Optimistic cart updates
  const optimisticCart = useOptimistic<ShoppingCart | null>(null);

  // Convenience methods
  const loadProducts = useCallback((params?: ProductSearchParams) => {
    return productsListApi.refresh(params);
  }, [productsListApi]);

  const loadFeaturedProducts = useCallback(() => {
    return featuredProductsApi.execute();
  }, [featuredProductsApi]);

  const loadProduct = useCallback((id: string) => {
    return productDetailApi.execute(id);
  }, [productDetailApi]);

  const searchProducts = useCallback((query: string, params?: ProductSearchParams) => {
    return searchProductsApi.refresh(query, params);
  }, [searchProductsApi]);

  const loadRecommendations = useCallback((productId?: string) => {
    return recommendationsApi.execute(productId);
  }, [recommendationsApi]);

  const loadVendors = useCallback(() => {
    return vendorsApi.refresh();
  }, [vendorsApi]);

  const loadVendor = useCallback((id: string) => {
    return vendorDetailApi.execute(id);
  }, [vendorDetailApi]);

  const loadVendorProducts = useCallback((vendorId: string) => {
    return vendorProductsApi.refresh(vendorId);
  }, [vendorProductsApi]);

  const loadCategoryProducts = useCallback((categoryId: string) => {
    return categoryProductsApi.refresh(categoryId);
  }, [categoryProductsApi]);

  const loadCart = useCallback(() => {
    return cartApi.execute();
  }, [cartApi]);

  const addToCart = useCallback(
    (data: AddToCartData) => {
      // Optimistic update
      if (cartApi.data) {
        const existingItem = cartApi.data.items.find(item => item.product.id === data.product_id);
        if (existingItem) {
          const updatedCart = {
            ...cartApi.data,
            items: cartApi.data.items.map(item =>
              item.product.id === data.product_id
                ? { ...item, quantity: item.quantity + data.quantity }
                : item
            ),
          };
          optimisticCart.updateOptimistically(updatedCart);
        }
      }

      return addToCartApi.execute(data).catch((error) => {
        optimisticCart.revertUpdate();
        throw error;
      });
    },
    [addToCartApi, cartApi.data, optimisticCart]
  );

  const updateCartItem = useCallback(
    (itemId: string, quantity: number) => {
      return updateCartApi.execute(itemId, quantity);
    },
    [updateCartApi]
  );

  const removeFromCart = useCallback(
    (itemId: string) => {
      return removeFromCartApi.execute(itemId);
    },
    [removeFromCartApi]
  );

  const clearCart = useCallback(() => {
    return clearCartApi.execute();
  }, [clearCartApi]);

  const loadOrders = useCallback(() => {
    return ordersApi.refresh();
  }, [ordersApi]);

  const loadOrder = useCallback((id: string) => {
    return orderDetailApi.execute(id);
  }, [orderDetailApi]);

  const createOrder = useCallback((data: OrderCreateData) => {
    return createOrderApi.execute(data);
  }, [createOrderApi]);

  const loadProductReviews = useCallback((productId: string) => {
    return reviewsApi.refresh(productId);
  }, [reviewsApi]);

  const createProductReview = useCallback((data: ReviewCreateData) => {
    return createReviewApi.execute(data);
  }, [createReviewApi]);

  // Utility methods
  const getCartItemCount = useCallback(() => {
    const cart = optimisticCart.data || cartApi.data;
    return cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  }, [cartApi.data, optimisticCart.data]);

  const getCartTotal = useCallback(() => {
    const cart = optimisticCart.data || cartApi.data;
    return cart?.total_amount || 0;
  }, [cartApi.data, optimisticCart.data]);

  const isInCart = useCallback(
    (productId: string) => {
      const cart = optimisticCart.data || cartApi.data;
      return cart?.items.some(item => item.product.id === productId) || false;
    },
    [cartApi.data, optimisticCart.data]
  );

  const getCartItemQuantity = useCallback(
    (productId: string) => {
      const cart = optimisticCart.data || cartApi.data;
      const item = cart?.items.find(item => item.product.id === productId);
      return item?.quantity || 0;
    },
    [cartApi.data, optimisticCart.data]
  );

  return {
    // State
    products: productsListApi.data,
    featuredProducts: featuredProductsApi.data || [],
    currentProduct: productDetailApi.data,
    searchResults: searchProductsApi.data,
    recommendations: recommendationsApi.data || [],
    vendors: vendorsApi.data,
    currentVendor: vendorDetailApi.data,
    vendorProducts: vendorProductsApi.data,
    categories: categoriesApi.data || [],
    categoryProducts: categoryProductsApi.data,
    cart: optimisticCart.data || cartApi.data,
    orders: ordersApi.data,
    currentOrder: orderDetailApi.data,
    productReviews: reviewsApi.data,

    // Loading states
    productsLoading: productsListApi.loading,
    featuredProductsLoading: featuredProductsApi.loading,
    productDetailLoading: productDetailApi.loading,
    searchLoading: searchProductsApi.loading,
    recommendationsLoading: recommendationsApi.loading,
    vendorsLoading: vendorsApi.loading,
    vendorDetailLoading: vendorDetailApi.loading,
    vendorProductsLoading: vendorProductsApi.loading,
    categoriesLoading: categoriesApi.loading,
    categoryProductsLoading: categoryProductsApi.loading,
    cartLoading: cartApi.loading,
    addToCartLoading: addToCartApi.loading,
    updateCartLoading: updateCartApi.loading,
    removeFromCartLoading: removeFromCartApi.loading,
    clearCartLoading: clearCartApi.loading,
    ordersLoading: ordersApi.loading,
    orderDetailLoading: orderDetailApi.loading,
    createOrderLoading: createOrderApi.loading,
    reviewsLoading: reviewsApi.loading,
    createReviewLoading: createReviewApi.loading,

    // Error states
    productsError: productsListApi.error,
    featuredProductsError: featuredProductsApi.error,
    productDetailError: productDetailApi.error,
    searchError: searchProductsApi.error,
    recommendationsError: recommendationsApi.error,
    vendorsError: vendorsApi.error,
    vendorDetailError: vendorDetailApi.error,
    vendorProductsError: vendorProductsApi.error,
    categoriesError: categoriesApi.error,
    categoryProductsError: categoryProductsApi.error,
    cartError: cartApi.error,
    addToCartError: addToCartApi.error,
    updateCartError: updateCartApi.error,
    removeFromCartError: removeFromCartApi.error,
    clearCartError: clearCartApi.error,
    ordersError: ordersApi.error,
    orderDetailError: orderDetailApi.error,
    createOrderError: createOrderApi.error,
    reviewsError: reviewsApi.error,
    createReviewError: createReviewApi.error,

    // Pagination
    hasMoreProducts: productsListApi.hasMore,
    hasMoreSearchResults: searchProductsApi.hasMore,
    hasMoreVendors: vendorsApi.hasMore,
    hasMoreVendorProducts: vendorProductsApi.hasMore,
    hasMoreCategoryProducts: categoryProductsApi.hasMore,
    hasMoreOrders: ordersApi.hasMore,
    hasMoreReviews: reviewsApi.hasMore,

    // Actions
    loadProducts,
    loadFeaturedProducts,
    loadProduct,
    searchProducts,
    loadRecommendations,
    loadVendors,
    loadVendor,
    loadVendorProducts,
    loadCategoryProducts,
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadOrders,
    loadOrder,
    createOrder,
    loadProductReviews,
    createProductReview,

    // Utility methods
    getCartItemCount,
    getCartTotal,
    isInCart,
    getCartItemQuantity,

    // Reset methods
    resetAddToCartError: addToCartApi.reset,
    resetUpdateCartError: updateCartApi.reset,
    resetRemoveFromCartError: removeFromCartApi.reset,
    resetCreateOrderError: createOrderApi.reset,
    resetCreateReviewError: createReviewApi.reset,
  };
};
