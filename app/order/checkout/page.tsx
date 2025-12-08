"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toFullUrlCDN } from "@/lib/utils/toFullUrlCDN";
import toast from "react-hot-toast";

interface CheckoutOption {
  value?: string;
  optionTitle?: string;
  optionValue?: string;
  count: number;
}

interface CheckoutData {
  productId: number;
  productName: string;
  mainImg: string;
  sellPrice: number;
  quantity?: number;
  options: CheckoutOption[];
}

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  detail: string;
  zipcode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
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
    zipcode: "",
    isDefault: false,
  });

  // -----------------------------
  // 전화번호 자동 하이픈 적용 함수
  // -----------------------------
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, ""); // 숫자만 남기기

    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return digits.replace(/(\d{3})(\d{1,4})/, "$1-$2");
    return digits.replace(/(\d{3})(\d{4})(\d{1,4}).*/, "$1-$2-$3");
  };

  // -----------------------------
  // PortOne 카드 결제 진행
  // -----------------------------
  const handleCardPayment = async () => {
    if (!selectedAddress) {
      toast.error("배송지를 선택해주세요.");
      return;
    }

    // 카드 결제용 OrderRequestDTO
    const orderData = {
      items: itemsToShow.map((item) => ({
        productId: item.productId,
        quantity: item.options.reduce((sum, opt) => sum + opt.count, 0),
        optionValues: item.options.map((o) => o.value),
      })),
      addressId: selectedAddress,
    };

    try {
      setLoading(true);

      // 1) 백엔드 — 카드 주문 READY 생성
      const res = await fetch(`${API_URL}/api/orders/checkout/card`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),   // ← items[], addressId
      });

      if (!res.ok) {
        toast.error("결제 준비 중 오류 발생");
        return;
      }

      const order = await res.json(); // { orderId, orderNumber, totalPrice }

      // 2) PortOne 결제창 열기
      const payment = await (window as any).PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
        paymentId: `payment-${order.orderId}-${Date.now()}`,
        orderName: order.orderNumber,
        totalAmount: order.totalPrice,
        currency: "KRW",
        payMethod: "CARD",
        redirectUrl: window.location.origin + "/payment/result",
      });

      if (payment.code && payment.code !== "SUCCESS") {
        toast.error("결제 취소 또는 실패");
        return;
      }

      // 3) 백엔드에 결제 검증 요청
      const verify = await fetch(`${API_URL}/api/payment/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.paymentId,
          orderId: order.orderId,
          items: orderData.items,       // 결제 완료 후 완전한 물건 목록 전달
          addressId: selectedAddress,   // 배송지 전달
        }),
      });

      const verifyMsg = await verify.text();

      if (!verify.ok) {
        toast.error("결제 검증 실패: " + verifyMsg);
        return;
      }

      toast.success("결제가 완료되었습니다!");

      clearCart();
      router.push("/order/complete");

    } catch (err) {
      console.error(err);
      toast.error("결제 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // 배송지 목록 불러오기 (백엔드)
  // -----------------------------
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/address`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("배송지 목록 조회 실패");

      const list: Address[] = await res.json();
      setAddresses(list);

      // 기본 배송지 선택 또는 첫 번째 배송지 선택
      const defaultOne = list.find((a) => a.isDefault);
      setSelectedAddress(defaultOne ? defaultOne.id : list[0]?.id || null);
    } catch (err) {
      console.error("배송지 불러오기 오류:", err);
    }
  };

  // -----------------------------
  // 바로 구매 데이터 로딩
  // -----------------------------
  useEffect(() => {
    const checkoutSaved = sessionStorage.getItem("checkoutData");
    if (checkoutSaved) {
      setDirectData(JSON.parse(checkoutSaved));
    }
  }, []);

  // -----------------------------
  // 📌 장바구니 결제 vs 바로구매 분기
  // -----------------------------
  // directData = "바로구매(handleBuyNow)"로 넘어온 단건 결제 데이터
  // cart = 장바구니 데이터
  //
  // 규칙:
  // - directData가 있으면 → 바로구매 모드 → 장바구니를 완전히 무시한다
  // - directData가 없으면 → 장바구니 결제 모드
  //
  // 이유:
  //   바로구매는 단일 상품만 결제해야 하므로,
  //   장바구니 상품이 섞여 들어가면 안 된다.
  //   즉, 바로구매 모드일 때는 cart를 절대 합치면 안 됨.
  let itemsToShow: (CheckoutData & { quantity?: number })[] = [];

  if (directData) {

    // 바로구매 모드
    const hasOptions =
      directData.options &&
      Array.isArray(directData.options) &&
      directData.options.length > 0;

    if (!hasOptions) {
      // 옵션 없는 상품 → 기본 1개
      itemsToShow = [
        {
          productId: directData.productId,
          productName: directData.productName,
          mainImg: directData.mainImg,
          sellPrice: directData.sellPrice,
          options: [
            {
              value: "기본",
              count: directData.quantity ?? 1,
            },
          ],
        },
      ];
    } else {
      // 옵션 있는 상품
      itemsToShow = [
        {
          productId: directData.productId,
          productName: directData.productName,
          mainImg: directData.mainImg,
          sellPrice: directData.sellPrice,

          options: directData.options.map((opt) => {
            let optionText = "기본";

            // 상품 상세 페이지에서 넘겨준 단일 문자열 옵션
            if (opt.value && opt.value.trim() !== "") {
              optionText = opt.value;
            }

            // 옵션은 opt.count 만 있으면 됨
            const qty = opt.count ?? directData.quantity ?? 1;

            return {
              value: optionText,
              count: qty,
            };
          }),
        },
      ];
    }

  } else {
    // 장바구니 결제 모드
    // - directData가 없으면 장바구니에서 결제 버튼을 눌러 들어온 경우
    // - cart 배열을 기준으로 결제 상품 목록 구성
    if (cart && cart.length > 0) {
      itemsToShow.push(
        ...cart.map((c) => ({
          productId: c.productId,
          productName: c.productName,
          mainImg: c.thumbnail,
          sellPrice: c.price,
          options: c.optionValue
            ? [
              {
                value: `${c.optionTitle ?? ""} ${c.optionValue ?? ""}`, // e.g. ["색상 Ivory"]
                count: c.quantity,
              }
            ]
            : [  // 옵션 없는 상품
              {
                value: "기본",  // ["기본"]
                count: c.quantity,
              }
            ],
        }))
      );
    }
  }

  const totalPrice = itemsToShow.reduce(
    (sum, item) =>
      sum +
      item.options.reduce(
        (optSum, opt) => optSum + item.sellPrice * opt.count,
        0
      ),
    0
  );

  // -----------------------------
  // 신규 배송지 추가 (백엔드)
  // -----------------------------
  const addNewAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address) {
      toast.error("이름, 전화번호, 주소는 필수입니다.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/address/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });

      if (!res.ok) throw new Error("배송지 추가 실패");

      toast.success("배송지가 추가되었습니다!");

      // 서버에서 다시 불러오기
      await loadAddresses();
      setShowNewAddress(false);
      setNewAddress({
        name: "",
        phone: "",
        address: "",
        detail: "",
        zipcode: "",
        isDefault: false,
      });
    } catch (err) {
      console.error("배송지 추가 오류:", err);
    }
  };

  // -----------------------------
  // 주문 생성 요청
  // -----------------------------
  const handleOrder = async () => {
    if (!selectedAddress) {
      toast.error("배송지를 선택해주세요.");
      return;
    }

    const orderData = {
      items: itemsToShow.map((item) => ({
        productId: item.productId,
        quantity: item.options.reduce((sum, opt) => sum + opt.count, 0),
        optionValues: item.options.map((o) => o.value)
      })),
      addressId: selectedAddress
    };

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/orders/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("결제 실패 (서버 오류)");

      const result = await res.json();
      sessionStorage.setItem("lastOrder", JSON.stringify(result));

      clearCart();
      router.push("/order/complete");
    } catch (err) {
      console.error("결제 실패", err);
      toast.error("결제 중 오류가 발생했습니다.");
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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ----------------------------- */}
        {/* 배송지 목록 */}
        {/* ----------------------------- */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-black">배송지</h2>

          {addresses.map((addr) => (
            <label
              key={addr.id}
              className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all hover:ring-2 ${selectedAddress === addr.id
                ? "ring-black border-black"
                : "border-gray-200"
                }`}
            >
              <div className="space-y-1">
                <p className="font-semibold flex items-center gap-2">
                  <span>{addr.name}</span>

                  {addr.zipcode && <span className="text-sm text-gray-500">{addr.zipcode}</span>}

                  {addr.isDefault && <span className="text-sm text-gray-500">(기본)</span>}
                </p>
                <p className="text-gray-600 text-sm">
                  {addr.address} {addr.detail}
                </p>
                <p className="text-gray-600 text-sm">{addr.phone}</p>
              </div>

              <input
                type="radio"
                checked={selectedAddress === addr.id}
                onChange={() => setSelectedAddress(addr.id)}
                className="h-5 w-5 text-black"
              />
            </label>
          ))}

          {/* ----------------------------- */}
          {/* 배송지 직접 입력 */}
          {/* ----------------------------- */}
          <button
            onClick={() => setShowNewAddress(!showNewAddress)}
            className="text-black hover:underline mt-2 text-sm cursor-pointer"
          >
            {showNewAddress ? "입력 취소" : "배송지 직접 입력"}
          </button>

          {showNewAddress && (
            <div className="mt-3 bg-gray-50 p-4 border rounded-xl space-y-3">
              <input
                type="text"
                placeholder="이름"
                value={newAddress.name}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, name: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="전화번호"
                value={newAddress.phone}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    phone: formatPhoneNumber(e.target.value),
                  })
                }
                maxLength={13}
                className="w-full border rounded-lg px-3 py-2"
              />

              {/* 🔥 우편번호 + 주소찾기 버튼 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="우편번호"
                  value={newAddress.zipcode}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2"
                />

                <button
                  type="button"
                  onClick={() =>
                    new (window as any).daum.Postcode({
                      oncomplete(data: any) {
                        setNewAddress((prev) => ({
                          ...prev,
                          zipcode: data.zonecode,
                          address: data.roadAddress || data.jibunAddress,
                        }));
                      },
                    }).open()
                  }
                  className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-100 text-sm"
                >
                  주소 찾기
                </button>
              </div>

              {/* 주소 (자동 입력) */}
              <input
                type="text"
                placeholder="주소"
                value={newAddress.address}
                readOnly
                className="w-full border rounded-lg px-3 py-2"
              />

              {/* 상세주소 */}
              <input
                type="text"
                placeholder="상세 주소"
                value={newAddress.detail}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, detail: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={() =>
                    setNewAddress({
                      ...newAddress,
                      isDefault: !newAddress.isDefault,
                    })
                  }
                />
                기본 배송지 설정
              </label>

              <button
                onClick={addNewAddress}
                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 font-semibold transition cursor-pointer"
              >
                배송지 추가
              </button>
            </div>
          )}
        </div>

        {/* ----------------------------- */}
        {/* 주문 상품 */}
        {/* ----------------------------- */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-black">주문 상품</h2>

          {itemsToShow.map((item) =>
            item.options.map((opt, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl shadow-sm"
              >
                <img
                  src={toFullUrlCDN(item.mainImg) || "/images/default_main.png"}
                  className="w-20 h-20 object-contain rounded border"
                />

                <div className="flex-1">
                  <p className="font-medium text-black">{item.productName}</p>
                  <p className="text-gray-500 text-sm">{opt.value}</p>
                  <p className="text-gray-500 text-sm">수량: {opt.count}</p>
                </div>

                <div className="text-right font-semibold text-black">
                  {(item.sellPrice * opt.count).toLocaleString()}원
                </div>
              </div>
            ))
          )}
        </div>

        {/* ----------------------------- */}
        {/* 결제 금액 */}
        {/* ----------------------------- */}
        <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">
          <span className="text-black font-medium text-lg">총 결제 금액</span>
          <span className="text-red-600 font-bold text-xl">
            {totalPrice.toLocaleString()}원
          </span>
        </div>

        {/* ----------------------------- */}
        {/* 결제 버튼 */}
        {/* ----------------------------- */}
        <div className="space-y-2">
          <button
            onClick={handleOrder}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white cursor-pointer transition ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-900"
              }`}
          >
            {loading
              ? "결제 진행중..."
              : `${totalPrice.toLocaleString()}원 결제하기`}
          </button>

          <button
            onClick={handleCardPayment}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold border border-gray-300 cursor-pointer transition ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-200"
              }`}
          >
            {loading ? "결제 진행중..." : "카드로 결제하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
