"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface CheckoutOption {
  optionId: number;
  value: string;
  count: number;
}

interface CheckoutData {
  productId: number;
  productName: string;
  mainImg?: string;
  sellPrice: number;
  options: CheckoutOption[];
}

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart(); // CartContext에서 장바구니 가져오기

  const [directData, setDirectData] = useState<CheckoutData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 배송지 직접 입력 관련
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    // 바로 구매 상품 가져오기
    const checkoutSaved = sessionStorage.getItem("checkoutData");
    if (checkoutSaved) {
      setDirectData(JSON.parse(checkoutSaved));
    }
  }, []);

  // 바로 구매 + 장바구니 합치기
  const itemsToShow: (CheckoutData & { quantity?: number })[] = [];
  if (directData) itemsToShow.push(directData);
  if (cart && cart.length > 0) itemsToShow.push(
    ...cart.map(c => ({
      productId: c.productId,
      productName: c.productName,
      mainImg: c.thumbnail,
      sellPrice: c.price,
      options: c.option
        ? [{ optionId: c.option.optionId, value: `${c.option.optionTitle} ${c.option.optionValue}`, count: c.quantity }]
        : [{ optionId: 0, value: "기본", count: c.quantity }],
    }))
  );

  const totalPrice = itemsToShow.reduce(
    (sum, item) =>
      sum + item.options.reduce((optSum, o) => optSum + item.sellPrice * o.count, 0),
    0
  );

  const handleOrder = async () => {
    if (!selectedAddress) {
      alert("배송지를 선택해주세요.");
      return;
    }

    const orderData = {
      items: itemsToShow,
      address: addresses.find(a => a.id === selectedAddress),
      totalPrice,
    };

    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1000)); // 서버 요청 시뮬레이션
      alert("결제 성공!");

      sessionStorage.removeItem("checkoutData"); // 바로 구매 초기화
      clearCart(); // 장바구니 초기화

      router.push("/order-complete"); // 결제 완료 페이지로 이동
    } catch (err) {
      console.error(err);
      alert("결제 실패! 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (itemsToShow.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        결제 정보 불러오는 중...
        <img
          src="/images/signature_w.png"
          alt="Loading"
          className="inline-block w-10 h-10 animate-spin-slow mt-2"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 grid md:grid-cols-2 gap-8">
      {/* 왼쪽: 배송지 / 주문상품 */}
      <div className="space-y-6">
        {/* 배송지 */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">배송지</h2>
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className={`flex items-center justify-between border p-4 rounded-lg mb-3 cursor-pointer hover:ring-2 ${
                selectedAddress === addr.id ? "ring-blue-500 border-blue-300" : "border-gray-200"
              }`}
            >
              <div>
                <p className="font-medium">
                  {addr.name} {addr.isDefault && <span className="text-sm text-gray-500">(기본 배송지)</span>}
                </p>
                <p className="text-gray-600 text-sm">{addr.address}</p>
                <p className="text-gray-600 text-sm">{addr.phone}</p>
              </div>
              <input
                type="radio"
                name="address"
                value={addr.id}
                checked={selectedAddress === addr.id}
                onChange={() => setSelectedAddress(addr.id)}
                className="form-radio h-5 w-5 text-blue-500"
              />
            </label>
          ))}

          {/* 배송지 직접 입력 버튼 */}
          <button
            onClick={() => setShowNewAddress(!showNewAddress)}
            className="mt-2 text-sm text-blue-600 hover:underline cursor-pointer"
          >
            {showNewAddress ? "입력 취소" : "배송지 직접 입력"}
          </button>

          {/* 새 배송지 입력 폼 */}
          {showNewAddress && (
            <div className="mt-3 border p-4 rounded-lg space-y-3 bg-gray-50">
              <input
                type="text"
                placeholder="이름"
                value={newAddress.name}
                onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="전화번호"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="주소"
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <button
                onClick={() => {
                  if (!newAddress.name || !newAddress.phone || !newAddress.address) {
                    alert("모든 항목을 입력해주세요.");
                    return;
                  }
                  const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1;
                  const addr = { ...newAddress, id: newId };
                  setAddresses([...addresses, addr]);
                  setSelectedAddress(newId);
                  setShowNewAddress(false);
                  setNewAddress({ name: "", phone: "", address: "" });
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold cursor-pointer"
              >
                배송지 추가
              </button>
            </div>
          )}
        </div>

        {/* 주문 상품 */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">주문 상품</h2>
          {itemsToShow.map((item) =>
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
      </div>

      {/* 오른쪽: 결제 금액 */}
      <div className="space-y-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">결제 금액</h2>
          <div className="flex justify-between mb-2">
            <span>상품 금액</span>
            <span>{totalPrice.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>배송비</span>
            <span className="text-blue-600">무료배송</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-3">
            <span>총 결제 금액</span>
            <span className="text-red-600">{totalPrice.toLocaleString()}원</span>
          </div>
        </div>

        <button
          onClick={handleOrder}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition cursor-pointer ${loading ? "bg-gray-400 text-gray-200" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
        >
          {loading ? "결제 진행중..." : `${totalPrice.toLocaleString()}원 결제하기`}
        </button>
      </div>
    </div>
  );
}
