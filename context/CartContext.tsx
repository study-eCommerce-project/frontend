"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  thumbnailUrl?: string;
  count: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateCount: (id: number, count: number) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // ✅ 페이지 새로고침 시 localStorage에서 불러오기
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // ✅ 장바구니 변경 시 localStorage 저장
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, count: p.count + item.count } : p
        );
      }
      return [...prev, item];
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
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
