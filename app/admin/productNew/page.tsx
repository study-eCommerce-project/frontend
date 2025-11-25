"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  productName: string;
  description?: string;
  mainImg?: string;
  consumerPrice?: number;
  sellPrice: number;
  stock: number;
}

export default function ProductCreatePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  const router = useRouter();

  const [product, setProduct] = useState<Product>({
    productName: "",
    description: "",
    mainImg: "",
    consumerPrice: 0,
    sellPrice: 0,
    stock: 0,
  });

  const [previewImg, setPreviewImg] = useState<string | null>(null); // 컴포넌트 안으로 이동

  const handleChange = (field: keyof Product, value: any) => {
    setProduct({ ...product, [field]: value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!res.ok) throw new Error("저장 실패");

      alert("상품이 등록되었습니다.");
      router.push("/admin/productList");
    } catch (err) {
      console.error(err);
      alert("상품 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-4xl font-extrabold mb-10 text-gray-800 pb-4">
          상품 등록
        </h1>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* 왼쪽: 이미지 영역 */}
          <div className="flex flex-col items-center w-full">
            <div className="w-full md:w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-100 mb-4 flex items-center justify-center">
              <div className="w-full pt-[100%] relative">
                {previewImg ? (
                  <img
                    src={previewImg}
                    alt={product.productName}
                    className="absolute top-0 left-0 w-full h-full object-contain"
                  />
                ) : (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm md:text-base">
                    이미지 미리보기
                  </span>
                )}
              </div>
            </div>

            {/* 파일 업로드 */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = () => {
                    handleChange("mainImg", reader.result as string); // product 상태에 저장
                    setPreviewImg(reader.result as string); // 미리보기용 상태
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition
                file:border-0
                file:bg-blue-400
                file:text-white
                file:rounded-lg
                file:py-2
                file:px-4
                file:cursor-pointer
                file:hover:bg-blue-700
                file:transition"
            />
          </div>

          {/* 오른쪽: 정보 입력 */}
          <div className="flex flex-col gap-6">
            {/* 상품명 */}
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">상품명</label>
              <input
                type="text"
                value={product.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
                placeholder="상품명을 입력하세요"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">상품 설명</label>
              <textarea
                value={product.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="상품 설명을 입력하세요"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                rows={6}
              />
            </div>

            {/* 가격 / 재고 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">소비자가</label>
                <input
                  type="number"
                  value={product.consumerPrice || 0}
                  onChange={(e) => handleChange("consumerPrice", Number(e.target.value))}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">판매가</label>
                <input
                  type="number"
                  value={product.sellPrice}
                  onChange={(e) => handleChange("sellPrice", Number(e.target.value))}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">재고</label>
                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) => handleChange("stock", Number(e.target.value))}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={handleSave}
              className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-bold shadow-md"
            >
              상품 등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
