"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface WishlistContextType {
  likedProducts: number[];
  toggleWishlist: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [likedProducts, setLikedProducts] = useState<number[]>([]);

  useEffect(() => {
    // 서버에서 초기값 가져오기 가능
    const saved = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    setLikedProducts(saved);
  }, []);

  const toggleWishlist = (productId: number) => {
    setLikedProducts((prev) => {
      const isLiked = prev.includes(productId);
      const updated = isLiked ? prev.filter((id) => id !== productId) : [...prev, productId];
      localStorage.setItem("likedProducts", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <WishlistContext.Provider value={{ likedProducts, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
