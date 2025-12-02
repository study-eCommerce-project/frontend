"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Product {
  sellPrice: any;
  mainImg: string;
  productId: number;
  productName: string;
  thumbnail: string;
  price: number;
}

interface WishlistContextType {
  likedProducts: number[];          // 기존 likedProducts 그대로 유지
  productInfos: Record<number, Product>; // 서버에서 받아온 상품 정보
  toggleWishlist: (productId: number) => void;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [productInfos, setProductInfos] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);
useEffect(() => {
  console.log("likedProducts:", likedProducts);
  console.log("productInfos:", productInfos);
}, [likedProducts, productInfos]);

  useEffect(() => {
    // likedProducts 초기값 로컬스토리지에서 불러오기
    const saved = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    setLikedProducts(saved);

    // 서버에서 찜 상품 정보 불러오기
    if (saved.length > 0) {
      axios.get(`${API_URL}/api/like/my`, { withCredentials: true }) // 로그인 기반 API 호출
        .then(res => {
          const info: Record<number, Product> = {};
          res.data.forEach((p: Product) => {
            info[p.productId] = p;
          });
          setProductInfos(info);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const toggleWishlist = (productId: number) => {
    setLikedProducts(prev => {
      const isLiked = prev.includes(productId);
      const updated = isLiked ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem("likedProducts", JSON.stringify(updated));
      return updated;
    });

    // 서버에 좋아요 토글 요청
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
