"use client";

import { useEffect, useState } from "react";

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
  orderDate: string; // 주문 날짜 추가
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    // localStorage에서 주문 내역 불러오기
    const savedOrders = localStorage.getItem("orderHistory");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">주문 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">주문 내역</h1>

        {orders.map((order, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            {/* 주문 날짜 */}
            <div className="text-gray-500 text-sm">{order.orderDate}</div>

            {/* 배송지 */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h2 className="font-semibold text-gray-800 mb-2">배송지</h2>
              <p>{order.address.name}</p>
              <p>{order.address.phone}</p>
              <p>{order.address.address}</p>
            </div>

            {/* 주문 상품 */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
              <h2 className="font-semibold text-gray-800 mb-2">주문 상품</h2>
              {order.items.map((item) =>
                item.options.map((opt) => (
                  <div
                    key={`${item.productId}-${opt.optionId}`}
                    className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm"
                  >
                    <img
                      src={item.mainImg || "/images/default_main.png"}
                      alt={item.productName}
                      className="w-16 h-16 object-contain rounded border"
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

            {/* 결제 금액 */}
            <div className="flex justify-between text-gray-700 font-bold text-lg">
              <span>총 결제 금액</span>
              <span className="text-red-600">{order.totalPrice.toLocaleString()}원</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
