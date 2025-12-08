"use client";

import { useState } from "react";
import { useProductInfoLogic } from "@/hooks/useProductInfoLogic";
import { useOptionTotalPrice } from "@/hooks/useOptionTotalPrice";
import { Product } from "@/types/product";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Heart, Plus, Minus, X, Ban } from "lucide-react";
import toast from "react-hot-toast";

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

interface ProductInfoProps {
  product: Product;
  isAdmin?: boolean;
}

export default function ProductInfo({ product, isAdmin }: ProductInfoProps) {

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
    handleLike,
    handleAddToCart,
    handleBuyNow,
  } = useProductInfoLogic(product, user, addToCart, router);

  // 색상 옵션 여부
  const hasColorOptions = product.options?.some(opt => !!opt.colorCode);

  // 옵션 없는 상품일 때 수량 관리
  const [singleCount, setSingleCount] = useState(1);

  // 총 가격 합산 (옵션 없으면 단일 수량 × 가격)
  const finalPrice = product.isOption
    ? useOptionTotalPrice(product, selectedOptions)
    : product.sellPrice * singleCount;

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

        {/* 옵션이 없고 재고가 0이면 품절 표시 */}
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
            <>
              {/* 드롭다운 버튼 */}
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
                        className={`
                          p-3 flex justify-between items-center rounded-lg transition
                          ${isSoldOut
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                            : "hover:bg-gray-100 cursor-pointer"}
                          ${isSelected ? "bg-gray-200" : ""}
                        `}
                      >
                        <div className="flex items-center gap-2">
                          {/* 품절 아이콘 */}
                          {isSoldOut && (
                            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          )}

                          <span>{opt.optionValue}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700">
                            {Number(opt.sellPrice).toLocaleString()}원
                          </span>

                          {isSoldOut ? (
                            <span className="text-gray-500 text-xs font-semibold flex items-center gap-1">
                              <Ban size={12} /> 품절
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              {opt.stock}개
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {/* 옵션이 없는 단일 상품 수량 조절 */}
      {!product.isOption && product.stock > 0 && (
        <div className="flex flex-col gap-4 mb-6 w-full">
          <div className="border p-4 rounded-xl shadow bg-white flex justify-between items-center">
            <div className="flex-1">
              <p className="font-medium text-black">
                {product.productName}
                <span className="ml-2 text-gray-600 text-sm">
                  {product.sellPrice.toLocaleString()}원
                </span>
              </p>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setSingleCount(prev => Math.max(1, prev - 1))}
                  className="p-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                >
                  <Minus size={16} />
                </button>

                <span className="font-semibold text-black">{singleCount}</span>

                <button
                  onClick={() => {
                    if ((product.stock ?? 0) <= singleCount) {
                      toast.error("더 이상 수량을 늘릴 수 없습니다.");
                      return;
                    }


                    setSingleCount(prev => prev + 1);
                  }}
                  className="p-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 선택된 옵션 목록 */}
      {product.isOption && (
        <div className="flex flex-col gap-4 mb-6 w-full">
          {selectedOptions.map(item => (
            <div
              key={item.optionId}
              className="border p-4 rounded-xl shadow bg-white flex justify-between items-center"
            >
              <div className="flex-1">
                <p className="font-medium text-black">
                  {item.optionValue}
                  <span className="ml-2 text-gray-600 text-sm">
                    {item.sellPrice.toLocaleString()}원
                  </span>
                </p>

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
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="font-semibold text-black">{item.count}</span>

                  <button
                    onClick={() => {
                      if ((item.stock ?? 0) <= item.count) {
                        toast.error("선택한 옵션의 재고가 부족합니다.");
                        return;
                      }
                      setSelectedOptions(prev =>
                        prev.map(p =>
                          p.optionId === item.optionId
                            ? { ...p, count: p.count + 1 }
                            : p
                        )
                      );
                    }}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedOptions(prev => prev.filter(p => p.optionId !== item.optionId))
                }
                className="text-red-400 hover:text-red-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------- 총 결제 금액 ---------------------- */}
      <div className="flex justify-between text-lg font-bold text-black w-full">
        <span>총 결제 금액</span>
        <span>{finalPrice.toLocaleString()}원</span>
      </div>

      {/* ---------------------- 좋아요 + 버튼 영역 ---------------------- */}
      {/* 좋아요 버튼 */}
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={handleLike}
          className={`p-2 border rounded-lg flex items-center gap-2 
               bg-white border-gray-300 
               md:w-auto w-full
               cursor-pointer
            ${liked ? "bg-rose-50 border-rose-300" : "bg-white border-gray-300"}
          `}
        >
          <Heart
            className={`w-7 h-7 ${liked ? "fill-rose-500 stroke-rose-500" : "stroke-gray-400"}`}
          />
          <span className={`text-base font-medium ${liked ? "text-rose-500" : "text-gray-500"}`}>
            {likeCount.toLocaleString()}
          </span>
        </button>

        {/* 장바구니 + 구매하기 */}
        {!isAdmin && (
          <div className="flex flex-1 gap-4">
            <button
              onClick={() => {
                // 품절 체크 (옵션 없는 단일 상품)
                if (!product.isOption && product.stock === 0) {
                  toast.error("품절된 상품입니다.");
                  return;
                }

                // 정상 장바구니 추가
                product.isOption
                  ? handleAddToCart(1)
                  : handleAddToCart(singleCount);
              }}
              className="flex-1 bg-black text-white py-3 rounded-xl cursor-pointer"
            >
              장바구니
            </button>

            <button
              onClick={() => {
                // 품절 체크
                if (!product.isOption && product.stock === 0) {
                  toast.error("품절된 상품입니다.");
                  return;
                }

                // 정상 구매 실행
                product.isOption
                  ? handleBuyNow(1)
                  : handleBuyNow(singleCount);
              }}
              className="flex-1 bg-white text-black py-3 rounded-xl border cursor-pointer"
            >
              구매하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}