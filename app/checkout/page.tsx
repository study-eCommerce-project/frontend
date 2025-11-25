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
  detail: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const [directData, setDirectData] = useState<CheckoutData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    detail: "",
  });

  // 저장된 배송지 + myInfo 주소 불러오기
  useEffect(() => {
    const savedAddresses = localStorage.getItem("myAddresses");
    let parsed: Address[] = savedAddresses ? JSON.parse(savedAddresses) : [];

    const myInfoRaw = localStorage.getItem("myInfo");
    if (myInfoRaw) {
      const myInfo = JSON.parse(myInfoRaw);

      if (myInfo.address) {
        const myInfoAddress: Address = {
          id: 999,
          name: myInfo.name || "내 정보",
          phone: myInfo.phone || "",
          address: myInfo.address || "",
          detail: myInfo.detailAddress || "", // 상세주소 안전하게
          isDefault: true,
        };

        if (!parsed.some(a => a.id === 999)) parsed.unshift(myInfoAddress);
      }
    }

    setAddresses(parsed);

    const defaultOne = parsed.find(a => a.isDefault);
    setSelectedAddress(defaultOne ? defaultOne.id : parsed[0]?.id || null);
  }, []);

  // 바로 구매 데이터
  useEffect(() => {
    const checkoutSaved = sessionStorage.getItem("checkoutData");
    if (checkoutSaved) setDirectData(JSON.parse(checkoutSaved));
  }, []);

  // 주문 리스트
  const itemsToShow: (CheckoutData & { quantity?: number })[] = [];
  if (directData) itemsToShow.push(directData);
  if (cart && cart.length > 0) {
    itemsToShow.push(
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
  }

  const totalPrice = itemsToShow.reduce(
    (sum, item) => sum + item.options.reduce((optSum, o) => optSum + item.sellPrice * o.count, 0),
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
      await new Promise(res => setTimeout(res, 1000));
      sessionStorage.setItem("lastOrder", JSON.stringify(orderData));
      router.push("/order/complete");
      sessionStorage.removeItem("checkoutData");
      clearCart();
    } catch (err) {
      console.error("결제 실패", err);
    } finally {
      setLoading(false);
    }
  };

  if (itemsToShow.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">결제 정보 불러오는 중...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 배송지 */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">배송지</h2>

          {addresses.length === 0 && <p className="text-sm text-gray-500">등록된 배송지가 없습니다.</p>}

          {addresses.map(addr => (
            <label
              key={addr.id}
              className={`flex justify-between items-center p-4 border rounded-lg cursor-pointer hover:ring-2 ${selectedAddress === addr.id ? "ring-blue-500 border-blue-300" : "border-gray-200"}`}
            >
              <div className="space-y-1">
                <p className="font-medium">{addr.name} {addr.isDefault && <span className="text-sm text-gray-500">(기본)</span>}</p>
                <p className="text-gray-600 text-sm">{addr.address} {addr.detail}</p>
                <p className="text-gray-600 text-sm">{addr.phone}</p>
              </div>
              <input
                type="radio"
                checked={selectedAddress === addr.id}
                onChange={() => setSelectedAddress(addr.id)}
                className="form-radio h-5 w-5 text-blue-500"
              />
            </label>
          ))}

          <button
            onClick={() => setShowNewAddress(!showNewAddress)}
            className="text-blue-600 hover:underline mt-2 text-sm cursor-pointer"
          >
            {showNewAddress ? "입력 취소" : "배송지 직접 입력"}
          </button>

          {showNewAddress && (
            <div className="mt-3 bg-gray-50 p-4 border border-gray-200 rounded-lg space-y-3">
              <input type="text" placeholder="이름" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} className="w-full border rounded px-3 py-2" />
              <input type="text" placeholder="전화번호" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className="w-full border rounded px-3 py-2" />
              <input type="text" placeholder="주소" value={newAddress.address} onChange={e => setNewAddress({ ...newAddress, address: e.target.value })} className="w-full border rounded px-3 py-2" />
              <input type="text" placeholder="상세주소" value={newAddress.detail} onChange={e => setNewAddress({ ...newAddress, detail: e.target.value })} className="w-full border rounded px-3 py-2" />
              <button
                onClick={() => {
                  if (!newAddress.name || !newAddress.phone || !newAddress.address) {
                    alert("모든 항목을 입력해주세요.");
                    return;
                  }
                  const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1;
                  const addr: Address = { ...newAddress, id: newId };
                  const updated = [...addresses, addr];
                  setAddresses(updated);
                  localStorage.setItem("myAddresses", JSON.stringify(updated));
                  setSelectedAddress(newId);
                  setShowNewAddress(false);
                  setNewAddress({ name: "", phone: "", address: "", detail: "" });
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                배송지 추가
              </button>
            </div>
          )}
        </div>

        {/* 주문 상품 */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">주문 상품</h2>
          {itemsToShow.map(item => item.options.map(opt => (
            <div key={`${item.productId}-${opt.optionId}`} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg shadow-sm">
              <img src={item.mainImg || "/images/default_main.png"} className="w-20 h-20 object-contain rounded border" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.productName}</p>
                <p className="text-gray-500 text-sm">{opt.value}</p>
                <p className="text-gray-500 text-sm">수량: {opt.count}</p>
              </div>
              <div className="text-right font-semibold text-gray-800">{(item.sellPrice * opt.count).toLocaleString()}원</div>
            </div>
          )))}
        </div>

        {/* 결제 금액 */}
        <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">
          <span className="text-gray-800 font-medium text-lg">총 결제 금액</span>
          <span className="text-red-600 font-bold text-xl">{totalPrice.toLocaleString()}원</span>
        </div>

        {/* 결제 버튼 */}
        <div className="text-center">
          <button onClick={handleOrder} disabled={loading} className={`w-full py-3 rounded-lg font-semibold text-white cursor-pointer ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
            {loading ? "결제 진행중..." : `${totalPrice.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </div>
    </div>
  );
}
