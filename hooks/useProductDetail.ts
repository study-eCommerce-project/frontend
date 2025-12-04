import { useEffect, useState } from "react";
import { fetchProductDetail } from "@/lib/api/product";
import { Product, Option } from "@/types/product";

/**
 * 상품 상세 데이터를 불러오는 커스텀 훅
 *
 * 기능:
 * - 상품 상세 API 호출
 * - 옵션 데이터를 프론트 타입 구조에 맞게 변환(optionValue → value)
 * - ProductInfo, ProductImages 등 상세 페이지에서 바로 사용 가능한 형태로 제공
 *
 * @param id - 상품 ID (상품 상세 요청에 사용)
 * @returns product - 정제된 상품 정보(Product | null)
 */

export function useProductDetail(id: number) {
  // 상품 상세 데이터를 저장하는 상태
  const [product, setProduct] = useState<Product>(null as any);
  const [loading, setLoading] = useState<boolean>(true); //로딩 상태
  const [error, setError] = useState<string | null>(null);  // 에러 상태

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);  // 로딩 시작
        const data = await fetchProductDetail(id);

        if (!data) {
          setProduct(null as any);
          setError("상품을 불러오는 데 실패했습니다.");
          return;
        }

        // 백엔드에서 { optionId, optionValue } 형태로 옴
        const mappedProduct: Product = {
          ...data,
          options: data.options?.map((opt: any) => ({
            optionId: opt.optionId,
            optionValue: opt.optionValue,
            stock: opt.stock,       // ⭐ 이거 추가
          })),
        };

        // 3) 상태 업데이트
        setProduct(mappedProduct);
        setError(null);  // 에러 초기화
      } catch (err) {
        console.error("상품 상세 정보 불러오기 오류:", err);
        setError("상품 정보를 불러오는 데 오류가 발생했습니다.");
        setProduct(null as any);  // 오류 발생 시 null로 상태 업데이트
      } finally {
        setLoading(false);  // 로딩 완료
      }
    };

    fetchDetail();
  }, [id]);  // id가 변경되면 다시 상세 조회

  // 커스텀 훅의 반환값: 정제된 상품 데이터, 로딩 상태, 에러 상태
  return product; //{ product, loading, error };
}
