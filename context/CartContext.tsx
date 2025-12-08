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
 * Debounce Utility
 *  - 서버 요청이 연속적으로 여러 번 호출될 때
 *    마지막 호출만 실행되도록 조절하는 함수
 *  - 장바구니 수량/옵션 변경 시 서버 부하 방지
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

  // option 객체가 아니라 optionValue / optionTitle 개별 필드로 옴
  optionValue?: string | null;
  optionTitle?: string | null;
}

/** --------------------------------------
 * CartContext Public API
 *
 *  - cart: 장바구니 목록
 *  - initialLoading: 첫 로딩 여부
 *  - loadCart(): 서버에서 장바구니 불러오기
 *  - addToCart(): 장바구니 추가
 *  - updateQuantity(): 수량 변경
 *  - changeOption(): 옵션 변경
 *  - deleteItem(): 항목 삭제
 *  - clearCart(): 전체 비우기
 * -------------------------------------- */
interface CartContextType {
  cart: CartItem[];
  initialLoading: boolean;
  loadCart: () => void;
  addToCart: (productId: number, optionValue: string | null, quantity: number) => void;
  updateQuantity: (cartId: number, quantity: number) => void;
  changeOption: (cartId: number, newOptionValue: string) => void; 
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
   * loadCart()
   * - 로그인한 일반 유저만 장바구니를 가져옴
   * - Admin은 장바구니 기능 미사용
   * - 서버에서 최신 장바구니 가져옴
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
        setInitialLoading(false);   // 페이지 첫 로딩만 종료
      });
  }, [user, isAdmin]);

    /** --------------------------------------
   * Debounced loadCart()
   * - 수량/옵션 변경이 연속적으로 발생할 때
   *   서버 요청을 1번만 보내도록 조절(연타 대비 서버 요청 줄이기)
   * -------------------------------------- */
  const debouncedLoadCart = useMemo(() => debounce(loadCart, 250), [loadCart]);

  /** --------------------------------------
   * addToCart()
   * - 상품 상세에서 장바구니 담기 버튼 클릭 시 호출
   * - 서버 호출 후 debouncedLoadCart로 최신 데이터 반영
   * -------------------------------------- */
  function addToCart(productId: number, optionValue: string | null, quantity: number) {
    console.log("addToCart payload:", { productId, optionValue, quantity });

    if (isAdmin || !user) return;

    axios
      .post(`/api/cart`, { productId, optionValue, quantity })  // optionId 대신 optionValue 사용
      .then(() => debouncedLoadCart())
      .catch((err) => console.error("장바구니 담기 실패:", err));
  }

  /** --------------------------------------
   * updateQuantity()
   * - 수량 증가/감소 버튼 클릭 시 호출
   * - UI는 즉시 반영(Optimistic UI)
   * - 서버 업데이트는 디바운스로 처리
   * -------------------------------------- */
  function updateQuantity(cartId: number, quantity: number) {
    if (isAdmin || !user) return;

    // UI 즉시 반영(먼저 수정)
    setCart((prev) =>
      prev.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
    );

    // 서버 요청은 디바운스 적용
    axios
      .put(`${API_URL}/api/cart/quantity`, { cartId, quantity })
      .then(() => debouncedLoadCart());
  }

  /** --------------------------------------
   * changeOption()
   * - 옵션 변경 UI가 있는 경우 사용
   * - 서버에 옵션값 업데이트 요청
   * -------------------------------------- */
  function changeOption(cartId: number, newOptionValue: string) {
    if (isAdmin || !user) return;

    // 서버 요청 (디바운스 적용)
    axios
      .put(`${API_URL}/api/cart/option`, { cartId, newOptionValue })
      .then(() => debouncedLoadCart())
      .catch((err) => {
        console.error("옵션 변경 실패:", err);
        loadCart();  // 실패시 새로 고침
      });
  }

  /** --------------------------------------
   * deleteItem() - 개별 항목 삭제
   * -------------------------------------- */
  function deleteItem(cartId: number) {
    if (isAdmin || !user) return;

    axios
      .delete(`${API_URL}/api/cart/${cartId}`)
      .then(() => debouncedLoadCart());
  }

  /** --------------------------------------
   * clearCart() - 장바구니 전체 비우기
   * -------------------------------------- */
  function clearCart() {
    if (isAdmin || !user) return;

    axios
      .delete(`${API_URL}/api/cart`, { withCredentials: true })
      .then(() => setCart([]));  // 프론트 상태 비우기
  }


  /** --------------------------------------
   * useEffect — 유저 상태 변화 감지하여 자동 로딩
   * - 로그인 → 장바구니 불러오기
   * - 로그아웃 / Admin → 장바구니 초기화
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

/** --------------------------------------
 * useCart()
 * - CartContext 안전하게 사용하기 위한 커스텀 훅
 * -------------------------------------- */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};