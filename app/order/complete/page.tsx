"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface OrderItem {
  productId: number;
  productName: string;
  mainImg?: string;
  sellPrice: number;
  options: { optionId: number; value: string; count: number }[];
}

interface OrderData {
  items: OrderItem[];
  address: {
    name: string;
    phone: string;
    address: string;
  };
  totalPrice: number;
}

export default function OrderCompletePage() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem("lastOrder");

    if (savedOrder) {
      const data = JSON.parse(savedOrder);
      setOrder(data);
      setTimeout(() => sessionStorage.removeItem("lastOrder"), 0);
    } else {
      router.push("/");
    }
  }, [router]);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">주문 내역 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">결제 완료</h1>
          <p className="text-gray-500">주문이 정상적으로 완료되었습니다.</p>
        </div>

        {/* 배송지 */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">배송지</h2>
          <div className="space-y-1 text-gray-700">
            <p className="font-medium">{order.address.name}</p>
            <p>{order.address.phone}</p>
            <p>{order.address.address}</p>
          </div>
        </div>

        {/* 주문 상품 */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">주문 상품</h2>
          <div className="space-y-4">
            {order.items.map((item) =>
              item.options.map((opt) => (
                <div
                  key={`${item.productId}-${opt.optionId}`}
                  className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm"
                >
                  <img
                    src={item.mainImg || "/images/default_main.png"}
                    alt={item.productName}
                    className="w-20 h-20 object-contain rounded border"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.productName}</p>
                    <p className="text-gray-500 text-sm">{opt.value}</p>
                    <p className="text-gray-500 text-sm">수량: {opt.count}</p>
                  </div>
                  <div className="text-right font-semibold text-gray-800">
                    {item.sellPrice.toLocaleString()}원
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 결제 금액 */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">결제 금액</h2>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>총 결제 금액</span>
            <span className="font-bold text-red-600 text-lg">{order.totalPrice.toLocaleString()}원</span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
