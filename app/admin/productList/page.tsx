"use client";

import { useEffect, useState } from "react";

interface Product {
  productId: number;
  productName: string;
  consumerPrice: number;
  sellPrice: number;
  mainImg: string;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 상품 불러오기
  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        상품 불러오는 중...
        <img
          src="/images/signature_w.png"
          alt="Loading"
          className="inline-block w-8 h-8 md:w-20 md:h-20 mx-[2px] -mb-2 animate-spin-slow"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">상품 리스트</h1>

      {/* 상품 목록 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">상품 목록</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">상품명</th>
                <th className="py-2 px-4 text-left">소비자가</th>
                <th className="py-2 px-4 text-left">판매가</th>
                <th className="py-2 px-4 text-left">이미지</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.productId} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{p.productId}</td>
                  <td className="py-2 px-4">{p.productName}</td>
                  <td className="py-2 px-4">{p.consumerPrice.toLocaleString()}원</td>
                  <td className="py-2 px-4">{p.sellPrice.toLocaleString()}원</td>
                  <td className="py-2 px-4">
                    <a href={`/admin/productEdit/${p.productId}`} target="_blank" rel="noopener noreferrer">
                      <img
                        src={p.mainImg}
                        alt={p.productName}
                        className="w-20 h-20 object-contain rounded hover:scale-105 transition-transform"
                      />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
