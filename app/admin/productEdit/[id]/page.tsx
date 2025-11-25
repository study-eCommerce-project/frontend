"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Product {
  productId: number;
  productName: string;
  description?: string;
  mainImg?: string;
  consumerPrice?: number;
  sellPrice: number;
  stock: number;
}

interface ProductOption {
  name: string;
  stock: number;
}

export default function ProductEditPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (!res.ok) throw new Error("상품을 불러오는 중 오류 발생");
        const data: Product = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading || !product) {
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

  const handleChange = (field: keyof Product, value: any) => {
    setProduct({ ...product, [field]: value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/${product.productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error("저장 실패");
      alert("상품 정보가 저장되었습니다.");
      router.push("/admin");
    } catch (err) {
      console.error(err);
      alert("상품 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">상품 수정</h1>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* 왼쪽: 이미지 */}
          <div className="flex flex-col items-center">
            {product.mainImg && (
              <img
                src={product.mainImg}
                alt={product.productName}
                className="w-full md:w-full object-contain rounded-lg border mb-4"
              />
            )}
            <input
              type="text"
              value={product.mainImg || ""}
              onChange={(e) => handleChange("mainImg", e.target.value)}
              className="w-full border p-2 rounded-lg"
              placeholder="메인 이미지 URL"
            />
          </div>

          {/* 오른쪽: 정보 */}
          <div className="flex flex-col gap-6">
            {/* 상품명 */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">상품명</label>
              <input
                type="text"
                value={product.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">설명</label>
              <textarea
                value={product.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={6}
              />
            </div>

            {/* 가격 / 재고 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">소비자가</label>
                <input
                  type="number"
                  value={product.consumerPrice || 0}
                  onChange={(e) => handleChange("consumerPrice", Number(e.target.value))}
                  className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">판매가</label>
                <input
                  type="number"
                  value={product.sellPrice}
                  onChange={(e) => handleChange("sellPrice", Number(e.target.value))}
                  className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">재고</label>
                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) => handleChange("stock", Number(e.target.value))}
                  className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              className="mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
