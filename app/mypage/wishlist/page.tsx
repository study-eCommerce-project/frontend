"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useWishlist } from "../../../context/WishlistContext";

interface WishlistItem {
  productId: number;
  productName: string;
  mainImg?: string;
  sellPrice?: number;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  // const {wishlist, removeFromWishlist } = useWishlist();
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/like/my", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("찜 목록 불러오기 실패");

      const data = await res.json();
      setWishlist(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeItem = async (productId: number) => {
    await fetch(`http://localhost:8080/api/like/toggle/${productId}`, {
      method: "POST",
      credentials: "include",
    });

    loadWishlist();
  };

  if (loading) return <p className="text-center py-10">로딩 중...</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">찜한 상품</h1>

        {wishlist.length === 0 ? (
          <p className="text-gray-500 text-center py-10 text-lg">
            찜한 상품이 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-xl shadow p-4 flex flex-col items-center gap-2"
              >
                <Link href={`/product/${item.productId}`}>
                  <img
                    src={item.mainImg || "/images/default_main.png"}
                    alt={item.productName}
                    className="w-full h-40 object-contain rounded-lg"
                  />
                </Link>

                <p className="text-gray-800 font-medium text-center">
                  {item.productName}
                </p>

                <p className="text-black font-bold">
                  {/* {item.sellPrice.toLocaleString()}원 */}
                  {item.sellPrice
                    ? `${item.sellPrice.toLocaleString()}원`
                    : ""}
                </p>

                <button
                // onClick={() => removeFromWishlist(item.productId)}
                  onClick={() => removeItem(item.productId)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm mt-2"
                >
                  <Trash2 size={14} /> 삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
