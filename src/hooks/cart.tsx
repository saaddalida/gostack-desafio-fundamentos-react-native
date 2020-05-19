import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const cart = [...products];
      const productIndex = products.findIndex(item => item.id === product.id);

      if (productIndex === -1) {
        const newProduct = { ...product, quantity: 1 };
        setProducts(oldState => [...oldState, newProduct]);
      } else {
        cart[productIndex] = {
          ...cart[productIndex],
          quantity: cart[productIndex].quantity + 1,
        };
        setProducts(cart);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const cart = [...products];
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex !== -1) {
        cart[productIndex] = {
          ...cart[productIndex],
          quantity: cart[productIndex].quantity + 1,
        };

        setProducts(cart);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const cart = [...products];
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex !== -1 && products[productIndex].quantity > 1) {
        cart[productIndex] = {
          ...cart[productIndex],
          quantity: cart[productIndex].quantity - 1,
        };

        setProducts(cart);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
