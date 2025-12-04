"use client";
import { useProductInfoLogic } from "@/hooks/useProductInfoLogic";
import { Product } from "@/types/product";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import { Heart, Plus, Minus, X } from "lucide-react";

/**
 * 상품 상세 정보 UI 컴포넌트
 *
 * - 상품명/가격 표시
 * - 카테고리 경로 표시
 * - 옵션 선택 UI 처리 (드롭다운 + 색상 팔레트)
 * - 좋아요 버튼
 * - 장바구니 / 구매하기 버튼
 *
 * ※ 모든 비즈니스 로직은 useProductInfoLogic 훅으로 분리됨
 */

export default function ProductInfo({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useUser();
  const { addToCart } = useCart();

  const {
    selectedOptions,
    setSelectedOptions,
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    handleSelectOption,
    liked,
    likeCount,
    likeLoading,
    handleLike,
    handleAddToCart,
    handleBuyNow,
  } = useProductInfoLogic(product, user, addToCart, router);

  // 색상 옵션 여부
  const hasColorOptions = product.options?.some(opt => !!opt.colorCode);
  console.log(product.options)
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">

      {/* ----------------------------------------------------
          카테고리 경로 표시
          ex) 남성의류 > 상의 > 후드티
      ---------------------------------------------------- */}
      {product.categoryPath && (
        <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
          {product.categoryPath.split(">").map((cat, idx, arr) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="text-gray-600">{cat.trim()}</span>
              {idx < arr.length - 1 && (
                <span className="text-gray-400">/</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* 상품명 */}
      <h1 className="text-3xl font-bold text-black">{product.productName}</h1>

      {/* 가격 정보 */}
      <div className="mb-6 text-center md:text-left space-y-1">
        {product.consumerPrice && product.consumerPrice > product.sellPrice && (
          <span className="text-red-500 text-lg font-semibold">
            {Math.round(
              ((product.consumerPrice - product.sellPrice) / product.consumerPrice) * 100
            )}%
            할인
          </span>
        )}
        {product.consumerPrice && (
          <p className="text-gray-400 text-sm line-through">
            {product.consumerPrice.toLocaleString()}원
          </p>
        )}
        <p className="text-3xl font-bold text-black">{product.sellPrice?.toLocaleString()}원</p>
        <p className="text-gray-600 text-sm">재고: {product.stock}개</p>
        
        {/* 🔥 옵션이 없고 재고가 0이면 품절 표시 */}
        {!product.isOption && product.stock === 0 && (
          <p className="text-red-500 font-semibold text-base mt-1">
            품절된 상품입니다
          </p>
        )}
      </div>

      {/* 옵션 선택 영역 */}
      {product.isOption && product.options?.length && (
        <div className="mb-6 relative w-full" ref={dropdownRef}>
          <label className="block text-gray-700 mb-2 font-medium">옵션 선택</label>

          {/* 색상 팔레트 */}
          {hasColorOptions ? (
            <div className="flex gap-2 flex-wrap">
              {product.options.map(opt => {
                const isSelected = selectedOptions.some(o => o.optionId === opt.optionId);
                const isSoldOut = opt.stock === 0;
                return (
                  <button
                    key={opt.optionId}
                    onClick={() =>
                      !isSoldOut &&
                      handleSelectOption({
                        optionId: opt.optionId,
                        optionValue: opt.optionValue,
                        stock: opt.stock,
                        colorCode: opt.colorCode,
                        sellPrice: opt.sellPrice,
                      })
                    }
                    className={`w-10 h-10 rounded-full border-2 transition flex items-center justify-center ${isSelected ? "border-black" : "border-gray-200"
                      } ${isSoldOut ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    style={{ backgroundColor: opt.colorCode }}
                    title={`${opt.optionValue} ${isSoldOut ? "(품절)" : `(${opt.stock}개)`}`}
                  >
                    {isSelected && <div className="w-3 h-3 bg-white rounded-full"></div>}
                  </button>
                );
              })}
            </div>
          ) : (
            // 기존 드롭다운
            <>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-full border border-gray-300 rounded-lg p-2 text-left bg-white hover:ring-2 hover:ring-black transition cursor-pointer"
              >
                {selectedOptions.length === 0
                  ? "옵션 선택"
                  : selectedOptions.map((o) => o.optionValue).join(", ")}
              </button>
              {dropdownOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {product.options.map(opt => {
                    const isSelected = selectedOptions.some(o => o.optionId === opt.optionId);
                    const isSoldOut = opt.stock === 0;
                    return (
                      <li
                        key={opt.optionId}
                        onClick={() =>
                          !isSoldOut &&
                          handleSelectOption({
                            optionId: opt.optionId,
                            optionValue: opt.optionValue,
                            stock: opt.stock,
                            colorCode: opt.colorCode,
                            sellPrice: opt.sellPrice,
                          })
                        }
                        className={`p-2 flex justify-between items-center hover:bg-gray-100 cursor-pointer ${isSelected ? "bg-gray-200" : ""
                          } ${isSoldOut ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span>{opt.optionValue}</span>
                        <div className="flex items-center gap-2">
                          {/* ★ 옵션별 가격 */}
                          <span className="text-sm font-semibold text-gray-700">
                            {Number(opt.sellPrice).toLocaleString()}원
                          </span>
                        </div>
                        
                        {isSoldOut ? (
                          <span className="text-red-500 text-xs font-semibold">품절</span>
                        ) : (
                          <span className="text-base font-semibold text-gray-700">{opt.stock}개</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {/* 선택된 옵션 목록 */}
      <div className="flex flex-col gap-4 mb-6 w-full">
        {selectedOptions.map(item => (
          <div
            key={item.optionId}
            className="border p-4 rounded-xl shadow flex justify-between items-center w-full bg-white"
          >
            <div className="flex-1">
              <p className="font-medium text-black">
                {item.optionValue}
                <span className="ml-2 text-gray-600 text-sm">
                  {Number(item.sellPrice).toLocaleString()}원
                </span>
              </p>

              {/* 수량 조절 */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() =>
                    setSelectedOptions(prev =>
                      prev.map(p =>
                        p.optionId === item.optionId
                          ? { ...p, count: Math.max(1, p.count - 1) }
                          : p
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
                    setSelectedOptions(prev =>
                      prev.map(p =>
                        p.optionId === item.optionId
                          ? { ...p, count: p.count + 1 }
                          : p
                      )
                    )
                  }
                  className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedOptions(prev => prev.filter(p => p.optionId !== item.optionId))}
              className="text-red-400 hover:text-red-600 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* 좋아요 + 장바구니 + 구매하기 */}
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 p-2 border rounded-lg transition-all w-full md:w-auto cursor-pointer ${liked ? "bg-rose-50 border-rose-300" : "bg-white border-gray-300"
            }`}
        >
          <Heart
            className={`w-7 h-7 ${liked ? "fill-rose-500 stroke-rose-500" : "stroke-gray-400"}`}
          />
          <span className={`text-base font-medium ${liked ? "text-rose-500" : "text-gray-500"}`}>
            {likeCount.toLocaleString()}
          </span>
        </button>

        <button
          onClick={handleAddToCart}
          className="flex-1 w-full bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition cursor-pointer"
        >
          장바구니
        </button>

        <button
          onClick={handleBuyNow}
          className="flex-1 w-full bg-white text-black py-3 rounded-xl hover:bg-gray-100 transition cursor-pointer border border-gray-300"
        >
          구매하기
        </button>
      </div>
    </div>
  );
}
