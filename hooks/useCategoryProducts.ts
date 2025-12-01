"use client";

import { useEffect, useState } from "react";
import { fetchProductsByCategory } from "@/lib/api/product";
import { Product } from "@/types/product";

/**
 * 특정 카테고리(leafCode)의 상품 목록을 불러오는 커스텀 훅
 *
 * 기능:
 * - 카테고리 코드가 변경되면 자동으로 상품 목록 재조회
 * - 로딩 상태 관리
 * - 오류 처리
 *
 * 사용 예:
 * const { products, loading } = useCategoryProducts("00010001");
 */

export function useCategoryProducts(leafCode: string) {
  // 상품 리스트 상태
  const [products, setProducts] = useState<Product[]>([]);

  // 로딩 상태 (스피너/로딩 UI에 사용)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // leafCode가 없으면 API 요청하지 않음
    if (!leafCode) return;

    // 비동기 방식으로 데이터 호출
    async function load() {
      setLoading(true);
      try {
        // API 호출 → 상품 목록 가져옴
        const data = await fetchProductsByCategory(leafCode);
        setProducts(data);
      } catch (err) {
        // 에러 발생 시 로그 출력
        console.error("카테고리 상품 조회 실패:", err);
      } finally {
        // 로딩 종료
        setLoading(false);
      }
    }

    load();  // 실행
  }, [leafCode]);  // leafCode가 바뀌면 자동 재요청

  return { products, loading };   // 훅 반환값 → UI(페이지)에서 바로 사용 가능
}
