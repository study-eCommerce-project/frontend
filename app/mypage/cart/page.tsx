/**
 * 📌 [왜 CartPage는 별도로 분리하지 않고 하나의 컴포넌트로 유지하는가?]
 *
 * 1) UI 중심 페이지이며 로직 대부분이 CartContext에 이미 분리되어 있음
 *    - 장바구니 데이터 로딩(loadCart)
 *    - 수량 변경(updateQuantity)
 *    - 상품 삭제(deleteItem)
 *    → 이 핵심 비즈니스 로직은 이미 CartContext에 있음
 *    → CartPage는 "UI를 보여주는 역할"만 담당 → 그대로 두는 게 가장 효율적
 *
 * 2) 계산 로직(totalPrice)도 매우 단순하며 재사용도 거의 없음
 *    - totalPrice = cart.reduce(...) 는 오직 이 페이지에서만 사용됨
 *    - 훅으로 따로 빼면 오히려 지나친 분리(Over-engineering)가 됨
 *
 * 3) 리스트 렌더링 + UI 조합이 대부분이라 컴포넌트 분리 이득이 적음
 *    - 장바구니 아이템 리스트를 Item 컴포넌트로 분리할 수도 있으나,
 *      상태 변경(updateQuantity, deleteItem)이 모두 CartContext에 있어 그대로 사용 가능.
 *    - 분리하면 props 전달만 늘어나며 복잡성 증가 → 유지보수 효율 ↓
 *
 * 4) 페이지 길이가 200~250줄 수준 → 가독성이 크게 떨어지지 않음
 *    - 더 길어질 경우 컴포넌트 분리를 고려할 수 있으나,
 *      현재는 불필요한 구조 분리만 생김.
 *
 * 5) 장바구니 UI는 대부분 “페이지 단독 구성” 패턴
 *    - 여러 페이지에서 재사용되지 않음
 *    - 오직 CartPage에서만 쓰이는 UI라서 분리할 의미가 낮음
 *
 *  결론:
 * - 로직은 이미 Context로 깔끔하게 분리되어 있고
 * - 남은 부분은 UI 렌더링이라 페이지 하나로 유지하는 것이 가장 안정적이고 간단함.
 * - 지금 구조가 실무에서 쓰기에도 충분히 좋음!
 */
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { cart, initialLoading, deleteItem, updateQuantity, clearCart } = useCart();

  // 로딩 화면
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        장바구니 불러오는 중...
      </div>
    );
  }

  // 장바구니 비어있음
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-10 text-center">
          <h1 className="text-2xl font-bold mb-4">장바구니</h1>
          <p className="text-gray-500 text-lg">장바구니가 비어있습니다.</p>
        </div>
      </div>
    );
  }

  // 전체 금액
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="py-10 px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ------------------------------ */}
        {/* 🔥 장바구니 리스트 */}
        {/* ------------------------------ */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6 flex flex-col gap-6 relative">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">장바구니</h1>

          {/* 전체 삭제 버튼 */}
          <button
            onClick={clearCart}
            className="absolute top-6 right-6 flex items-center gap-1 px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
          >
            <Trash2 size={16} />
            전체 삭제
          </button>

          {cart.map((item) => (
            <div
              key={item.cartId}
              className="flex flex-col md:flex-row items-center gap-4 border-b border-gray-200 pb-4"
            >
              {/* 썸네일 */}
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

                {/* 옵션 출력 */}
                {item.optionValue && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.optionTitle ? `${item.optionTitle}: ` : ""}
                    <span className="font-medium">{item.optionValue}</span>
                  </p>
                )}

                {/* 품절 상태 */}
                  {item.soldOut && (
                    <p className="text-red-500 text-sm font-semibold mt-1">
                      품절된 상품입니다
                    </p>
                  )}
                </div>

                {/* 수량, 가격, 삭제 버튼 */}
                <div className="flex items-center justify-between mt-3">

                  {/* 수량 제어 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.cartId, Math.max(1, item.quantity - 1))
                      }
                      className="p-1 bg-gray-300 rounded hover:bg-gray-400 transition cursor-pointer"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="w-6 text-center text-gray-800 font-medium">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                      className="p-1 bg-gray-300 rounded hover:bg-gray-400 transition cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* 가격 + 삭제 */}
                  <div className="flex items-center gap-3">
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

        {/* ------------------------------ */}
        {/* 💳 결제 정보 */}
        {/* ------------------------------ */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-6 h-fit sticky top-10">
          <h2 className="text-xl font-bold text-gray-900 mb-2">결제 정보</h2>

          <div className="flex flex-col gap-3 text-gray-700">
            <div className="flex justify-between">
              <span>상품 금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>

            <div className="flex justify-between">
              <span>배송비</span>
              <span className="text-black font-semibold">무료</span>
            </div>

            <div className="flex justify-between pt-3 border-t font-bold text-lg">
              <span>총 결제 금액</span>
              <span className="text-black">{totalPrice.toLocaleString()}원</span>
            </div>
          </div>

          <button
            onClick={() => {
              sessionStorage.removeItem("checkoutData");  // 단건 구매 데이터(세션스토리지에 저장된 데이터) 삭제
                  router.push("/order/checkout");
            }}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 font-semibold transition cursor-pointer"
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}
