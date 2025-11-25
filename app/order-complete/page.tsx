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
      setOrder(JSON.parse(savedOrder));
      sessionStorage.removeItem("lastOrder"); // 불러온 후 삭제
    } else {
      // 결제 데이터 없으면 메인 페이지로
      router.push("/");
    }
  }, [router]);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        주문 내역 불러오는 중...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold">결제 완료</h1>
      <p className="text-gray-600">주문이 정상적으로 완료되었습니다.</p>

      {/* 배송지 */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">배송지</h2>
        <p className="font-medium">{order.address.name}</p>
        <p className="text-gray-600">{order.address.phone}</p>
        <p className="text-gray-600">{order.address.address}</p>
      </div>

      {/* 주문 상품 */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">주문 상품</h2>
        {order.items.map((item) =>
          item.options.map((opt) => (
            <div key={`${item.productId}-${opt.optionId}`} className="flex items-center gap-4 mb-4">
              <img
                src={item.mainImg || "/images/default_main.png"}
                className="w-20 h-20 object-contain rounded border"
              />
              <div>
                <p className="text-gray-800 font-medium">{item.productName}</p>
                <p className="text-gray-600 text-sm">{item.sellPrice.toLocaleString()}원</p>
                <p className="text-gray-500 text-sm">{opt.value} × {opt.count}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 결제 금액 */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">결제 금액</h2>
        <div className="flex justify-between mb-2">
          <span>총 결제 금액</span>
          <span className="text-red-600">{order.totalPrice.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
}
