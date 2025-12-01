"use client";

import { useUser } from "./UserContext";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import axios from "@/context/axiosConfig";

axios.defaults.withCredentials = true;

/** --------------------------------------
 * Debounce Utility (브라우저 환경 호환)
 * -------------------------------------- */
function debounce(callback: (...args: any[]) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

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
  initialLoading: boolean; 
  loadCart: () => void;
  addToCart: (productId: number, optionId: number | null, quantity: number) => void;
  updateQuantity: (cartId: number, quantity: number) => void;
  changeOption: (cartId: number, newOptionId: number) => void;
  deleteItem: (cartId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useUser();

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const [initialLoading, setInitialLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL; 


  /** --------------------------------------
   * loadCart — 서버에서 장바구니 불러오기
   * 조건 적고 호출 최소화 (실무 패턴)
   * -------------------------------------- */
  const loadCart = useCallback(() => {
    if (!user || !user.id || isAdmin) {
      setCart([]);
      setInitialLoading(false);
      return;
    }

    axios
      .get(`${API_URL}/api/cart`)
      .then((res) => setCart(res.data.items || []))
      .finally(() => {
        setInitialLoading(false);   // ← 페이지 첫 로딩만 종료
      });
  }, [user, isAdmin]);


  /** --------------------------------------
   * Debounced loadCart — 연타 대비 서버 요청 줄이기
   * -------------------------------------- */
  const debouncedLoadCart = useMemo(() => debounce(loadCart, 250), [loadCart]);

  /** --------------------------------------
   * Add to Cart
   * - 서버 요청 후 debouncedLoadCart만 호출
   * -------------------------------------- */
  function addToCart(productId: number, optionId: number | null, quantity: number) {
    console.log("addToCart payload:", { productId, optionId, quantity });

    if (isAdmin || !user) return;

    axios
      .post(`/api/cart`, { productId, optionId, quantity })
      .then(() => debouncedLoadCart())
      .catch((err) => console.error("장바구니 담기 실패:", err));
  }

  /** --------------------------------------
   * Update Quantity (optimis) UI + debounce)
   * -------------------------------------- */
  function updateQuantity(cartId: number, quantity: number) {
    if (isAdmin || !user) return;

    // UI 먼저 수정
    setCart((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
    );

    // 서버 요청은 디바운스 적용
    axios
      .put(`${API_URL}/api/cart/quantity`, { cartId, quantity })
      .then(() => debouncedLoadCart());
  }

  /** --------------------------------------
   * Change Option (Optimistic UI + debounce)
   * -------------------------------------- */
  function changeOption(cartId: number, newOptionId: number) {
    if (isAdmin || !user) return;

    // // Optimistic UI 업데이트
    // setCart((prev) =>
    //   prev.map((item) => {
    //     if (item.cartId !== cartId) return item;

    //     return {
    //       ...item,
    //       option: item.option
    //         ? { ...item.option, optionId: newOptionId }
    //         : { optionId: newOptionId },
    //     };
    //   })
    // );

    // 서버 요청 (디바운스 적용)
    axios
      .put(`${API_URL}/api/cart/option`, { cartId, newOptionId })
      .then(() => debouncedLoadCart());
  }


  /** --------------------------------------
   * Delete Item
   * -------------------------------------- */
  function deleteItem(cartId: number) {
    if (isAdmin || !user) return;

    axios
      .delete(`${API_URL}/api/cart/${cartId}`)
      .then(() => debouncedLoadCart());
  }

  /** 장바구니 비우기 */
  function clearCart() {
    setCart([]);
  }

  /** --------------------------------------
   * 로그인 상태 변화 감지하여 장바구니 로딩
   * -------------------------------------- */
  useEffect(() => {
    if (!user || isAdmin) {
      setCart([]);
      return;
    }
    loadCart();
  }, [user, isAdmin, loadCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        initialLoading,  
        loadCart,
        addToCart,
        updateQuantity,
        changeOption,
        deleteItem,
        clearCart,
      }}
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
