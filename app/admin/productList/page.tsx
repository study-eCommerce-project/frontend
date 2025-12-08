"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  productId: number;
  productName: string;
  consumerPrice: number;
  sellPrice: number;
  mainImg: string;
  isShow: boolean; 
}

export default function AdminListPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/admin/products/list`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  //검색
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) =>
          p.productName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, products]);

  // 상품 삭제
  const handleDelete = async (productId: number) => {
    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/products/${productId}/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      // 정상 응답이 아닌 경우 → 백엔드 메시지 읽기
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "상품 삭제 실패");
      }

      // 삭제 성공 시 UI 반영
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
      setFilteredProducts((prev) => prev.filter((p) => p.productId !== productId));

      toast.success("상품이 삭제되었습니다.");

    } catch (error: any) {
      console.error("상품 삭제 오류:", error);
      toast.error(error.message);
    }
  };



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
    <div className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">상품 리스트</h1>

        {/* 검색창 */}
        <div className="mb-6 w-full md:w-1/2 relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </span>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="상품명으로 검색..."
            className="w-full border rounded px-10 py-2 focus:ring-2 focus:ring-gray-500"
          />
        </div>


        {/* 상품 목록 */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">ID</th>
                  <th className="py-2 px-4 text-left">상품명</th>
                  <th className="py-2 px-4 text-left">소비자가</th>
                  <th className="py-2 px-4 text-left">판매가</th>
                  <th className="py-2 px-4 text-left">이미지</th>
                  <th className="py-2 px-4 text-left">삭제</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  // 상대 경로일 경우 BASE_URL을 결합하여 전체 URL 생성
                  const imageUrl = p.mainImg.startsWith("http") ? p.mainImg : `${IMAGE_BASE_URL}${p.mainImg}`;
                  return (
                    <tr key={p.productId} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{p.productId}</td>
                      <td className="py-2 px-4">{p.productName}</td>
                      <td className="py-2 px-4">{p.consumerPrice.toLocaleString()}원</td>
                      <td className="py-2 px-4">{p.sellPrice.toLocaleString()}원</td>
                      <td className="py-2 px-4">
                        <Link href={`/admin/productEdit/${p.productId}`}>
                          <img
                            src={imageUrl}  // 동적으로 결합된 URL 사용
                            alt={p.productName}
                            className="w-20 h-20 object-contain rounded hover:scale-105 transition-transform"
                          />
                        </Link>
                      </td>
                      <td className="py-2 px-4">
                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => handleDelete(p.productId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
