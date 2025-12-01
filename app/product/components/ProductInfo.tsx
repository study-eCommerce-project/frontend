"use client";
import { useProductInfoLogic } from "@/hooks/useProductInfoLogic";
import { Product } from "@/types/product";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Heart, Plus, Minus, X } from "lucide-react";

/**
 * 상품 상세 정보 UI 컴포넌트
 *
 * - 상품명/가격 표시
 * - 카테고리 경로 표시
 * - 옵션 선택 UI 처리
 * - 좋아요 버튼
 * - 장바구니 / 구매하기 버튼
 *
 * ※ 모든 비즈니스 로직은 useProductInfoLogic 훅으로 분리됨
 */

export default function ProductInfo({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useUser();
  const { addToCart } = useCart();

  // 상품 상세에 필요한 로직을 모두 커스텀 훅에서 가져옴
  const {
    selectedOptions,
    setSelectedOptions,
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    handleSelectOption,
    isLiked,
    likesCount,
    likeLoading,
    handleLike,
    handleAddToCart,
    handleBuyNow,
  } = useProductInfoLogic(product, user, addToCart, router);

  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">

      {/* 카테고리 */}
      {/* {product.categoryPath && (
        <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
          {product.categoryPath.split(">").map((cat, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="text-gray-600">{cat.trim()}</span>
              {idx < product.categoryPath.split(">").length - 1 && (
                <span className="text-gray-400">/</span>
              )}
            </span>
          ))}
        </div>
      )} */}

      {/* ----------------------------------------------------
          카테고리 경로 표시
          ex) 남성의류 > 상의 > 후드티
      ---------------------------------------------------- */}
      {product.categoryPath && (
        <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
          {product.categoryPath.split(">").map((cat, idx, arr) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="text-gray-600">{cat.trim()}</span>
              {/* 마지막 항목 뒤에는 "/" 표시 안 함 */}
              {idx < arr.length - 1 && (
                <span className="text-gray-400">/</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* 상품명 */}
      <h1 className="text-3xl font-bold text-black">{product.productName}</h1>

      {/* 가격 정보 (할인율, 소비자가, 판매가) */}
      <div className="mb-6 text-center md:text-left space-y-1">
        {product.consumerPrice && product.consumerPrice > product.sellPrice && (
          <span className="text-red-500 text-lg font-semibold">
            {Math.round(
              ((product.consumerPrice - product.sellPrice) / product.consumerPrice) * 100
            )}
            % 할인
          </span>
        )}
        {product.consumerPrice && (
          <p className="text-gray-400 text-sm line-through">
            {product.consumerPrice.toLocaleString()}원
          </p>
        )}
        <p className="text-3xl font-bold text-black">{product.sellPrice?.toLocaleString()}원</p>
        <p className="text-gray-600 text-sm">재고: {product.stock}개</p>
      </div>

      {/* ----------------------------------------------------
          옵션 선택 영역
          - 옵션 드롭다운
          - 옵션 선택 시 selectedOptions에 추가됨
      ---------------------------------------------------- */}
      {product.isOption && product.options?.length && (
        <div className="mb-6 relative w-full" ref={dropdownRef}>
          <label className="block text-gray-700 mb-2 font-medium">옵션 선택</label>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-full border border-gray-300 rounded-lg p-2 text-left bg-white hover:ring-2 hover:ring-black transition cursor-pointer"
          >
            {selectedOptions.length === 0
              ? "옵션 선택"
              : selectedOptions.map((o) => o.value).join(", ")}
          </button>
          {dropdownOpen && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {product.options.map((opt) => (
                <li
                  key={opt.optionId}
                  onClick={() =>
                      handleSelectOption({
                        optionId: opt.optionId,
                        value: opt.value  
                      })
                    }
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${selectedOptions.some((o) => o.optionId === opt.optionId) ? "bg-gray-200" : ""
                    }`}
                >
                  {opt.value}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          선택된 옵션 목록
          - 수량 + / -
          - 옵션 제거
      ---------------------------------------------------- */}
      <div className="flex flex-col gap-4 mb-6 w-full">
        {selectedOptions.map((item) => (
          <div
            key={item.optionId}
            className="border p-4 rounded-xl shadow flex justify-between items-center w-full bg-white"
          >
            <div className="flex-1">
              {/* 옵션명 */}
              <p className="font-medium text-black">{item.value}</p>
              
              {/* 수량 조절 */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() =>
                    setSelectedOptions((prev) =>
                      prev.map((p) =>
                        p.optionId === item.optionId ? { ...p, count: Math.max(1, p.count - 1) } : p
                      )
                    )
                  }
                  className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition cursor-pointer"
                >
                  <Minus size={16} />
                </button>
                <span className="font-semibold text-black">{item.count}</span>
                <button
                  onClick={() =>
                    setSelectedOptions((prev) =>
                      prev.map((p) =>
                        p.optionId === item.optionId ? { ...p, count: p.count + 1 } : p
                      )
                    )
                  }
                  className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* 옵션 삭제 */}
            <button
              onClick={() => setSelectedOptions((prev) => prev.filter((p) => p.optionId !== item.optionId))}
              className="text-gray-400 hover:text-black transition ml-4"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------
          좋아요 버튼 + 장바구니 + 구매하기
      ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        {/* 좋아요 */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 p-2 border rounded-lg w-full md:w-auto transition cursor-pointer ${isLiked ? "bg-rose-50 border-rose-300" : "bg-white border-gray-300"} hover:ring-2 hover:ring-black`}
        >
          <Heart className={`w-7 h-7 ${isLiked ? "fill-rose-500 stroke-rose-500" : "stroke-gray-400"}`} />
          <span className={`text-base font-medium ${isLiked ? "text-rose-500" : "text-gray-500"}`}>
            {likesCount}
          </span>
        </button>

        {/* 장바구니 */}
        <button
          onClick={handleAddToCart}
          className="flex-1 w-full bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition cursor-pointer"
        >
          장바구니
        </button>

        {/* 구매하기 */}
        <button
          onClick={handleBuyNow}
          className="flex-1 w-full bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition cursor-pointer"
        >
          구매하기
        </button>
      </div>
    </div>
  );
}
