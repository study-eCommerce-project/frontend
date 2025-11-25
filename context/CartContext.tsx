"use client";

import { useUser } from "./UserContext";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

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
  loadCart: () => void;
  addToCart: (productId: number, optionId: number | null, quantity: number) => void;
  updateQuantity: (cartId: number, quantity: number) => void;
  changeOption: (cartId: number, newOptionId: number) => void;
  deleteItem: (cartId: number) => void;
  clearCart: () => void; // 추가
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useUser();

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  /** 장바구니 불러오기 */
  function loadCart() {

    // 1) 로그인 안 되어 있으면 API 호출 금지
    if (!user) {
      setCart([]);
      return;
    }

    // 2) memberId 없는 경우도 금지 (백엔드에서 NPE 터짐)
    if (!user?.id) {
      setCart([]);
      return;
    }

    // 3) 관리자면 장바구니 없음 → 호출 금지
    if (isAdmin) {
      setCart([]);
      return;
    }

    // 4) 여기서만 호출됨 (중복 호출 없음)
    axios
      .get("http://localhost:8080/api/cart")
      .then((res) => setCart(res.data.items || []))
      .catch(() => setCart([]));
  }

  function addToCart(productId: number, optionId: number | null, quantity: number) {
    if (isAdmin) return;

    axios
      .post("http://localhost:8080/api/cart", { productId, optionId, quantity })
      .then(() => loadCart())
      .catch((err) => console.error("장바구니 담기 실패:", err));
  }

  function updateQuantity(cartId: number, quantity: number) {
    if (isAdmin) return;

    axios.put("http://localhost:8080/api/cart/quantity", { cartId, quantity }).then(() => loadCart());
  }

  function changeOption(cartId: number, newOptionId: number) {
    if (isAdmin) return;

    axios.put("http://localhost:8080/api/cart/option", { cartId, newOptionId }).then(() => loadCart());
  }

  function deleteItem(cartId: number) {
    if (isAdmin) return;

    axios.delete(`http://localhost:8080/api/cart/${cartId}`).then(() => loadCart());
  }

  /** 장바구니 비우기 */
  function clearCart() {
    setCart([]);
  }


  /** 로그인 변경 감지 */
  useEffect(() => {
    // 로그아웃 시 즉시 비우기
    if (!user) {
      setCart([]);
      return;
    }

    if (isAdmin) {
      setCart([]);
      return;
    }

    loadCart();
  }, [user]);

  return (
    <CartContext.Provider
      value={{ cart, loadCart, addToCart, updateQuantity, changeOption, deleteItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
