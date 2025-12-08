"use client";
import { useEffect, useState } from "react";

interface OrderItem {
  orderItemId: number;
  productId: number;
  productName: string | null;
  mainImg?: string | null;
  optionValue?: string | null;
  quantity: number;
  price: number;
}

interface OrderData {
  orderNumber: string;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  address: {
    name: string | null;
    phone: string | null;
    address: string | null;
    detail: string | null;
    zipcode: string | null;
  };
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [orders, setOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    async function loadOrders() {
      const res = await fetch(`${API_URL}/api/orders/history`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("주문 내역 로드 실패");
        return;
      }

      const data = await res.json();
      setOrders(data);
    }

    loadOrders();
  }, []);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">주문 내역</h1>

        {orders.map((order, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">

            {/* 주문 날짜 */}
            <div className="text-gray-500 text-sm">
              {order.createdAt?.replace("T", " ")}
            </div>

            {/* 결제 방식 */}
            <div className="text-sm text-gray-700 font-medium">
              결제 방식: <span className="font-bold">{order.paymentMethod}</span>
            </div>

            {/* 배송지 */}
            <Card title="배송지">
              <p className="font-semibold flex items-center gap-2">
                <span>{order.address.name}</span>
                <span className="text-sm text-gray-500">{order.address.zipcode}</span>
              </p>
              <p>{order.address.phone}</p>
              <p>
                {order.address.address} {order.address.detail || ""}
              </p>
            </Card>

            {/* 주문 상품 */}
            <Card title="주문 상품">
              <div className="space-y-2">

                {order.items?.map((item) => (
                  <div
                    key={item.orderItemId}
                    className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={item.mainImg || "/images/default_main.png"}
                      alt={item.productName || "상품"}
                      className="w-20 h-20 object-contain rounded border"
                    />

                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {item.productName || "상품명 없음"}
                      </p>
                      {item.optionValue && (
                        <p className="text-gray-500 text-sm">
                          옵션: {item.optionValue}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm">
                        수량: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right font-semibold text-gray-800">
                      {(item.price * item.quantity).toLocaleString()}원
                    </div>
                  </div>
                ))}

              </div>
            </Card>

            {/* 총 결제 금액 */}
            <div className="flex justify-between text-gray-700 font-bold text-lg">
              <span>총 결제 금액</span>
              <span className="text-red-600">
                {order.totalPrice.toLocaleString()}원
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      {children}
    </div>
  );
}
