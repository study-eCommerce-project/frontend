"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductDetailClient({
  product,
  user = null,
}: {
  product: any;
  user?: { name: string } | null;
}) {
  const [count, setCount] = useState(1);

  // 🛒 장바구니 저장
  const handleAddToCart = () => {
    if (!user) {
    const goLogin = window.confirm(
      "장바구니를 사용하려면 로그인해야 합니다.\n로그인 페이지로 이동하시겠습니까?"
    );
    if (goLogin) {
      window.location.href = "/login";
    }
    return;
  }

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = existingCart.findIndex(
      (item: any) => item.productId === product.productId
    );

    if (existingIndex !== -1) {
      existingCart[existingIndex].count += count;
    } else {
      existingCart.push({
        productId: product.productId,
        productName: product.productName,
        price: product.sellPrice,
        mainImg: product.mainImg,
        count,
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    alert("🛒 장바구니에 담겼습니다!");
  };

  return (
    <div className="max-w-xl w-full mx-auto bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
      {/* 상품명 */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
        {product.productName}
      </h1>

      {/* 대표 이미지 */}
      <div className="flex justify-center mb-6">
        <Image
          src={`${product.mainImg || "default_main.png"}`}
          alt={product.productName}
          width={400}
          height={320}
          className="rounded-lg object-contain"
        />
      </div>

      {/* 설명 */}
      <p className="text-gray-700 mb-4 text-center">
        {product.description || "설명이 없습니다."}
      </p>

      {/* 가격 */}
      <div className="text-center mb-8">
        <p className="text-gray-500 text-sm line-through">
          {product.consumerPrice?.toLocaleString()}원
        </p>
        <p className="text-3xl font-bold text-blue-600">
          {product.sellPrice?.toLocaleString()}원
        </p>
        <p className="text-gray-600 mt-1 text-sm">
          재고: {product.stock}개
        </p>
      </div>

      {/* 수량 조절 */}
      <div className="flex justify-center items-center space-x-5 mb-8">
        <button
          onClick={() => setCount((prev) => Math.max(1, prev - 1))}
          className="px-4 py-2 bg-gray-400 rounded-lg hover:bg-gray-500"
        >
          -
        </button>
        <span className="text-lg font-semibold text-gray-800">{count}</span>
        <button
          onClick={() => setCount((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-400 rounded-lg hover:bg-gray-500"
        >
          +
        </button>
      </div>

      {/* 장바구니 버튼 */}
      <button
        onClick={handleAddToCart}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition cursor-pointer">
        장바구니 담기
      </button>
    </div>
  );
}
