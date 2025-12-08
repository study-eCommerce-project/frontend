"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Product {
  productId: number;
  productName: string;
  mainImg: string;
  sellPrice: number;
  thumbnail: string;
  price: number;
}

interface WishlistContextType {
  likedProducts: number[];
  productInfos: Record<number, Product>;
  toggleWishlist: (productId: number) => Promise<void>;
  reloadWishlist: () => void;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [productInfos, setProductInfos] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);

  /**  서버에서 실제 찜 목록 불러오기 */
  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/like/my`, { withCredentials: true });

      const ids = res.data.map((p: Product) => p.productId);
      setLikedProducts(ids);

      const info: Record<number, Product> = {};
      res.data.forEach((p: Product) => (info[p.productId] = p));
      setProductInfos(info);

    } catch (err: any) {
      if (err.response?.status === 401) {
        // 로그인 안 되어있는 정상적인 케이스 → 로그 찍지 않고 조용히 빈값 처리
        setLikedProducts([]);
        setProductInfos({});
    } else {
      console.error("wishlist fetch error", err);
    }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  /** 좋아요 토글 */
  const toggleWishlist = async (productId: number) => {
    try {
      await axios.post(`${API_URL}/api/like/toggle/${productId}`, {}, { withCredentials: true });
      await loadWishlist(); // 서버 최신 데이터 반영
    } catch (err) {
      console.error("toggle like error", err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        likedProducts,
        productInfos,
        toggleWishlist,
        reloadWishlist: loadWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
