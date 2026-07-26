import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:3000' : '';
const CART_STORAGE_KEY = 'shopify_cart_id';

export const useShopifyStore = create((set, get) => ({
  status: null,
  products: [],
  currentProduct: null,
  cart: null,
  cartOpen: false,
  loading: false,
  cartLoading: false,
  error: null,

  setCartOpen: (cartOpen) => set({ cartOpen }),

  fetchStatus: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/shopify/status`);
      set({ status: response.data.data });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Shopify status:', error);
      set({
        status: {
          enabled: false,
          storefrontConfigured: false,
          adminConfigured: false,
        },
      });
      return null;
    }
  },

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${BASE_URL}/api/shopify/products`);
      set({ products: response.data.data, error: null });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.response?.status === 429
          ? 'Rate limit exceeded.'
          : 'Could not load Shopify products. Check SHOPIFY.md setup.');
      set({ error: message, products: [] });
    } finally {
      set({ loading: false });
    }
  },

  fetchProduct: async (handle) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${BASE_URL}/api/shopify/products/${handle}`);
      set({ currentProduct: response.data.data, error: null });
    } catch (error) {
      console.error('Error fetching Shopify product:', error);
      set({
        error: error.response?.data?.message || 'Product not found',
        currentProduct: null,
      });
    } finally {
      set({ loading: false });
    }
  },

  loadCart: async () => {
    const cartId = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartId) {
      set({ cart: null });
      return;
    }

    set({ cartLoading: true });
    try {
      const response = await axios.get(`${BASE_URL}/api/shopify/cart/${cartId}`);
      set({ cart: response.data.data });
    } catch (error) {
      console.error('Error loading cart:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
      set({ cart: null });
    } finally {
      set({ cartLoading: false });
    }
  },

  addToCart: async (variantId, quantity = 1) => {
    set({ cartLoading: true });
    try {
      const cartId = localStorage.getItem(CART_STORAGE_KEY);
      let response;

      if (cartId) {
        try {
          response = await axios.post(`${BASE_URL}/api/shopify/cart/lines`, {
            cartId,
            variantId,
            quantity,
          });
        } catch {
          response = await axios.post(`${BASE_URL}/api/shopify/cart`, {
            variantId,
            quantity,
          });
        }
      } else {
        response = await axios.post(`${BASE_URL}/api/shopify/cart`, {
          variantId,
          quantity,
        });
      }

      const cart = response.data.data;
      localStorage.setItem(CART_STORAGE_KEY, cart.id);
      set({ cart, cartOpen: true });
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Could not add to cart');
    } finally {
      set({ cartLoading: false });
    }
  },

  updateLineQuantity: async (lineId, quantity) => {
    const { cart } = get();
    if (!cart?.id) return;

    set({ cartLoading: true });
    try {
      if (quantity <= 0) {
        await get().removeLine(lineId);
        return;
      }

      const response = await axios.put(`${BASE_URL}/api/shopify/cart/lines`, {
        cartId: cart.id,
        lineId,
        quantity,
      });
      set({ cart: response.data.data });
    } catch (error) {
      console.error('Error updating cart line:', error);
      toast.error('Could not update cart');
    } finally {
      set({ cartLoading: false });
    }
  },

  removeLine: async (lineId) => {
    const { cart } = get();
    if (!cart?.id) return;

    set({ cartLoading: true });
    try {
      const response = await axios.delete(`${BASE_URL}/api/shopify/cart/lines`, {
        data: { cartId: cart.id, lineId },
      });
      set({ cart: response.data.data });
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Error removing cart line:', error);
      toast.error('Could not remove item');
    } finally {
      set({ cartLoading: false });
    }
  },

  checkout: () => {
    const { cart } = get();
    if (!cart?.checkoutUrl) {
      toast.error('Cart is empty');
      return;
    }
    window.location.href = cart.checkoutUrl;
  },

  syncProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.post(`${BASE_URL}/api/shopify/sync`);
      toast.success(response.data.message || 'Synced products');
      return response.data.data;
    } catch (error) {
      console.error('Error syncing products:', error);
      toast.error(error.response?.data?.message || 'Sync failed. Admin API token required.');
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));
