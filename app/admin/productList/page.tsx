"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // 한 페이지에 5개 표시

  // 상품 불러오기
  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => { })
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

  // 현재 페이지 데이터 계산
  const totalPages = Math.ceil(products.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const currentProducts = products.slice(startIdx, startIdx + pageSize);

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
              {currentProducts.map((p) => (
                <tr key={p.productId} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{p.productId}</td>
                  <td className="py-2 px-4">{p.productName}</td>
                  <td className="py-2 px-4">{p.consumerPrice.toLocaleString()}원</td>
                  <td className="py-2 px-4">{p.sellPrice.toLocaleString()}원</td>
                  <td className="py-2 px-4">
                    <a
                      href={`/admin/productEdit/${p.productId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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

        {/* 페이징 UI */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="disabled:opacity-40 hover:bg-gray-100 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded transition cursor-pointer ${currentPage === page
                ? "bg-black text-white border-black"
                : "hover:bg-gray-100"
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="disabled:opacity-40 hover:bg-gray-100 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
