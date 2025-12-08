"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../ui/Button";
import { toFullUrlCDN } from "@/lib/utils/toFullUrlCDN";


interface OrderItem {
  orderItemId: number;
  productId: number;
  productName: string;
  mainImg?: string;
  optionValue?: string | null;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Address {
  name: string;
  phone: string;
  address: string;
  detail?: string;
  zipcode: string;
}

interface OrderData {
  orderNumber: string;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  items: OrderItem[];
  address?: Address; // 안전하게 처리
}

export default function OrderCompletePage() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem("lastOrder");

    if (savedOrder) {
      const data: OrderData = JSON.parse(savedOrder);
      setOrder(data);

      // 주문 내역 로컬스토리지 저장
      const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
      const newHistory = [
        { ...data, orderDate: new Date().toLocaleString() },
        ...history,
      ];
      localStorage.setItem("orderHistory", JSON.stringify(newHistory));

      setTimeout(() => sessionStorage.removeItem("lastOrder"), 0);
    } else {
      router.push("/");
    }
  }, [router]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">주문 내역 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">결제 완료</h1>
          <p className="text-gray-500">주문이 정상적으로 완료되었습니다.</p>
        </div>

        {/* 배송지 */}
        {order.address && (
          <Card title="배송지">
            <div className="space-y-1 text-gray-700">
              <p className="font-semibold flex items-center gap-2">
                <span>{order.address.name}</span>
                <span className="text-sm text-gray-500">{order.address.zipcode}</span>
              </p>
              <p>{order.address.phone}</p>
              <p>
                {order.address.address} {order.address.detail || ""}
              </p>
            </div>
          </Card>
        )}

        {/* 주문 상품 */}
        <Card title="주문 상품">
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.orderItemId}
                className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <img
                  src={toFullUrlCDN(item.mainImg)} // 서버에서 이미지 안 주므로 안전 처리
                  alt={item.productName}
                  className="w-20 h-20 object-contain rounded border"
                />

                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {item.productName}
                  </p>

                  {/* 옵션값 표시 */}
                  {item.optionValue && (
                    <p className="text-gray-500 text-sm">{item.optionValue}</p>
                  )}

                  <p className="text-gray-500 text-sm">
                    수량: {item.quantity}
                  </p>
                </div>

                <div className="text-right font-semibold text-gray-800">
                  {item.subtotal.toLocaleString()}원
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 결제 금액 */}
        <Card title="결제 금액">
          <div className="flex justify-between text-gray-700 mb-2">
            <span>총 결제 금액</span>
            <span className="font-bold text-red-600 text-lg">
              {order.totalPrice.toLocaleString()}원
            </span>
          </div>
        </Card>

        <div className="text-center">
          <Button onClick={() => router.push("/")}>메인으로 돌아가기</Button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {children}
    </div>
  );
}
