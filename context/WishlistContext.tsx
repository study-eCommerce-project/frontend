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
  toggleWishlist: (productId: number) => void;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [productInfos, setProductInfos] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);

  // 1️⃣ 초기 likedProducts 로드
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    setLikedProducts(saved);
  }, []);

  // 2️⃣ likedProducts가 바뀔 때마다 상품 정보 fetch
  useEffect(() => {
    if (likedProducts.length === 0) {
      setProductInfos({});
      setLoading(false);
      return;
    }

    setLoading(true);
    axios.get(`${API_URL}/api/like/my`, { withCredentials: true })
      .then(res => {
        const info: Record<number, Product> = {};
        res.data.forEach((p: Product) => {
          info[p.productId] = p;
        });
        setProductInfos(info);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [likedProducts]);

  // 3️⃣ 찜 토글
  const toggleWishlist = (productId: number) => {
    setLikedProducts(prev => {
      const isLiked = prev.includes(productId);
      const updated = isLiked ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem("likedProducts", JSON.stringify(updated));

      // 삭제 시 productInfos에서도 제거
      if (isLiked) {
        setProductInfos(info => {
          const copy = { ...info };
          delete copy[productId];
          return copy;
        });
      }

      return updated;
    });

    // 서버에도 요청
    axios.post(`${API_URL}/api/like/toggle/${productId}`, {}, { withCredentials: true })
      .catch(err => console.error(err));
  };

  return (
    <WishlistContext.Provider value={{ likedProducts, productInfos, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
