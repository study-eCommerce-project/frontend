// 프론트 기반

// "use client";
// import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// interface CartItem {
//   id: number;
//   productId: number;
//   productName: string;
//   price: number;
//   thumbnailUrl: string;
//   option?: string | null;
//   color?: string | null;
//   count: number;
// }

// interface CartContextType {
//   cart: CartItem[];
//   addToCart: (item: CartItem) => void;
//   removeFromCart: (id: number) => void;
//   updateCount: (id: number, count: number) => void;
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export const CartProvider = ({ children }: { children: ReactNode }) => {
//   const [cart, setCart] = useState<CartItem[]>([]);

//   // LocalStorage에서 장바구니 불러오기
//   useEffect(() => {
//     const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
//     setCart(storedCart);
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("cart", JSON.stringify(cart));
//   }, [cart]);

//   const addToCart = (item: CartItem) => {
//     setCart((prev) => {
//       const existingIndex = prev.findIndex(
//         (i) =>
//           i.productId === item.productId &&
//           i.option === item.option &&
//           i.color === item.color
//       );
//       if (existingIndex !== -1) {
//         const newCart = [...prev];
//         newCart[existingIndex].count += item.count;
//         return newCart;
//       } else {
//         return [...prev, { ...item, id: Date.now() }];
//       }
//     });
//   };

//   const removeFromCart = (id: number) => {
//     setCart((prev) => prev.filter((item) => item.id !== id));
//   };

//   const updateCount = (id: number, count: number) => {
//     setCart((prev) =>
//       prev.map((item) => (item.id === id ? { ...item, count } : item))
//     );
//   };

//   return (
//     <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCount }}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error("useCart must be used within CartProvider");
//   return context;
// };



//  // 백엔드 기반 
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

axios.defaults.withCredentials = true; // ★★ 세션 쿠키 필수 설정

interface CartItem {
  cartId: number;
  productId: number;
  productName: string;
  thumbnail: string;
  quantity: number;
  price: number;
  stock: number;
  soldOut: boolean;
  option?: {
    optionId: number;
    optionType: string;
    optionTitle: string | null;
    optionValue: string | null;
  } | null;
}

interface CartContextType {
  cart: CartItem[];
  loadCart: () => Promise<void>;
  addToCart: (productId: number, optionId: number | null, quantity: number) => Promise<void>;
  updateQuantity: (cartId: number, quantity: number) => Promise<void>;
  changeOption: (cartId: number, newOptionId: number) => Promise<void>;
  deleteItem: (cartId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  async function loadCart() {
    const res = await axios.get("http://localhost:8080/api/cart");
    setCart(res.data.items);
  }

  async function addToCart(productId: number, optionId: number | null, quantity: number) {
    await axios.post("http://localhost:8080/api/cart", {
      productId,
      optionId,
      quantity,
    });
    await loadCart();
  }

  async function updateQuantity(cartId: number, quantity: number) {
    await axios.put("http://localhost:8080/api/cart/quantity", {
      cartId,
      quantity,
    });
    await loadCart();
  }

  async function changeOption(cartId: number, newOptionId: number) {
    await axios.put("http://localhost:8080/api/cart/option", {
      cartId,
      newOptionId,
    });
    await loadCart();
  }

  async function deleteItem(cartId: number) {
    await axios.delete(`http://localhost:8080/api/cart/${cartId}`);
    await loadCart();
  }
  
  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);;

  return (
    <CartContext.Provider value={{ cart, loadCart, addToCart, updateQuantity, changeOption, deleteItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

