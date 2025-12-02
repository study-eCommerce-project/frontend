/**
 * 📌 [왜 WishlistPage는 별도로 분리/리팩터링할 필요가 없는가?]
 *
 * 1) 로직 대부분이 매우 단순하며 재사용되지 않음
 *    - 찜 목록 조회(loadWishlist)
 *    - 개별 항목 삭제(removeItem)
 *    → 모두 이 페이지에서만 쓰이고 다른 곳에서 공유되지 않는 로직들임
 *    → 별도 훅(useWishlist)으로 빼봐야 이 페이지에서만 사용할 코드가 늘어날 뿐,
 *      유지보수 효율이 증가하지 않음.
 *
 * 2) 데이터 상태도 이 페이지에서만 사용
 *    - wishlist, loading 같은 상태는 이 페이지 완결형 구조
 *    - 글로벌 상태(Context)로 관리할 일도 없음 (장바구니와 달리)
 *
 * 3) UI 구성도 단순한 “리스트 렌더링 + 삭제 버튼”
 *    - 각 아이템을 별도 컴포넌트로 분리하는 선택도 가능하지만,
 *      복잡하지 않고 props도 단순해서 분리 이득이 거의 없음.
 *
 * 4) 페이지 길이가 크지 않아서 가독성이 충분히 양호함
 *    - 복잡한 UI 구조도 아니고 200줄 이하라 유지보수하기 쉬운 상태
 *
 * 5) 찜 기능은 글로벌하게 자주 사용되는 패턴이 아님
 *    - “좋아요 토글” API 만 이용하면 끝
 *    - 장바구니처럼 여러 페이지에서 공유하지 않기 때문에
 *      Context나 custom hook으로의 과한 분리는 Over-engineering
 *
 *  결론:
 * - WishlistPage는 한 번에 보기 쉽고 기능 범위도 작아서
 *   지금처럼 하나의 컴포넌트 안에서 완결형으로 유지하는 것이 가장 효율적이다.
 */
"use client";

import { useWishlist } from "../../../context/WishlistContext";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export default function WishlistPage() {
  const { likedProducts, productInfos, toggleWishlist, loading } = useWishlist();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-600 text-lg">찜한 상품 불러오는 중...</p>
      </div>
    );
  }

  if (!likedProducts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-600 text-lg">찜한 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="py-10 px-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">찜한 상품</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {likedProducts.map((productId) => {
          const product = productInfos[productId];

          return (
            <div
              key={productId}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col items-center gap-2"
            >
              <Link href={`/product/${productId}`}>
                <img
                  src={product.mainImg || "/images/default_main.png"}
                  alt={product.productName}
                  className="w-full h-40 object-contain rounded-xl"
                />
              </Link>

              <p className="text-gray-800 font-medium text-center truncate">
                {product.productName}
              </p>

              <p className="text-gray-900 font-bold">
                {product.sellPrice.toLocaleString()}원
              </p>

              <button
                onClick={() => toggleWishlist(productId)}
                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm mt-2 cursor-pointer"
              >
                <Trash2 size={14} /> 삭제
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
