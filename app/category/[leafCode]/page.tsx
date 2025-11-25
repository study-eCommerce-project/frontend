"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  productId: number;
  productName: string;
  sellPrice: number;
  stock: number;
  mainImg?: string;
}

const toFullUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
};

export default function CategoryPage({ params }: { params: Promise<{ leafCode: string }> }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  const router = useRouter();
  const { leafCode } = use(params); // ⭐ params 언랩

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!leafCode) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/products/category/${leafCode}`
        );

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("상품 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [leafCode]);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-xl font-bold mb-4">
        카테고리: <span className="font-normal">{leafCode}</span>
      </h1>

      {loading ? (
        <p>상품 불러오는 중...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">해당 카테고리에 상품이 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <li
              key={p.productId}
              className="border rounded-lg p-3 hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/product/${p.productId}`)}
            >
              {p.mainImg && (
                <img
                  src={toFullUrl(p.mainImg)}
                  alt={p.productName}
                  className="w-full h-40 object-contain mb-3"
                />
              )}

              <p className="font-semibold line-clamp-1">{p.productName}</p>
              <p className="text-blue-600 font-bold">
                {p.sellPrice.toLocaleString()}원
              </p>
              <p className="text-xs text-gray-500">재고: {p.stock}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
