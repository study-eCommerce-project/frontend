"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { cart, initialLoading, deleteItem, updateQuantity } = useCart();

  // 1)초기 로딩 중일 때
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        장바구니 불러오는 중...
      </div>
    );
  }


  // 2) 장바구니 비어있을 때
  if (!initialLoading && cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-10 text-center">
          <h1 className="text-2xl font-bold mb-4">장바구니</h1>
          <p className="text-gray-500 text-lg">장바구니가 비어있습니다.</p>
        </div>
      </div>
    );
  }

  // 3) 장바구니가 있을 때
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 장바구니 목록 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">장바구니</h1>

          {cart.map((item) => (
            <div
              key={item.cartId}
              className="flex flex-col md:flex-row items-center gap-4 border-b border-gray-200 pb-4"
            >
              <Link href={`/product/${item.productId}`}>
                <div className="w-28 h-28 flex-shrink-0">
                  <img
                    src={item.thumbnail || "/images/default_main.png"}
                    alt={item.productName}
                    width={112}
                    height={112}
                    className="rounded-lg object-contain border"
                  />
                </div>
              </Link>

              {/* 상품 정보 */}
              <div className="flex-1 flex flex-col justify-between h-full">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {item.productName}
                  </p>

                  {/* 옵션 표시 */}
                  {item.option && (
                    <p className="text-gray-500 text-sm mt-1">
                      옵션: [{item.option.optionTitle}] {item.option.optionValue}
                    </p>
                  )}

                  {/* 품절 표시 */}
                  {item.soldOut && (
                    <p className="text-red-500 text-sm font-semibold mt-1">
                      품절된 상품입니다
                    </p>
                  )}
                </div>

                {/* 수량 / 가격 / 삭제 */}
                <div className="flex items-center justify-between mt-3">

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.cartId, Math.max(1, item.quantity - 1))
                      }
                      className="p-1 bg-gray-400 rounded hover:bg-gray-500 transition cursor-pointer"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="w-6 text-center text-gray-800 font-medium">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(item.cartId, item.quantity + 1)
                      }
                      className="p-1 bg-gray-400 rounded hover:bg-gray-500 transition cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-bold">
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>

                    <button
                      onClick={() => deleteItem(item.cartId)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm cursor-pointer"
                    >
                      <Trash2 size={14} /> 삭제
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 결제 요약 */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-6 h-fit sticky top-10">
          <h2 className="text-xl font-bold text-gray-900 mb-2">결제 정보</h2>

          <div className="flex flex-col gap-3 text-gray-700">
            <div className="flex justify-between">
              <span>상품 금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span>배송비</span>
              <span className="text-blue-600">무료</span>
            </div>
            <div className="flex justify-between pt-3 border-t font-bold text-lg">
              <span>총 결제 금액</span>
              <span className="text-blue-600">{totalPrice.toLocaleString()}원</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition cursor-pointer"
          >
            {totalPrice.toLocaleString()}원 결제하기
          </button>
        </div>

      </div>
    </div>
  );
}
