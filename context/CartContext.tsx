"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  thumbnailUrl: string;
  option?: string | null;
  color?: string | null;
  count: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateCount: (id: number, count: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // LocalStorage에서 장바구니 불러오기
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.option === item.option &&
          i.color === item.color
      );
      if (existingIndex !== -1) {
        const newCart = [...prev];
        newCart[existingIndex].count += item.count;
        return newCart;
      } else {
        return [...prev, { ...item, id: Date.now() }];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCount = (id: number, count: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, count } : item))
    );
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
