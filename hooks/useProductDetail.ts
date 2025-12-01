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
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // 1) 상품 상세 API 호출
    fetchProductDetail(id).then((data) => {
      if (!data) return setProduct(null);

      // 2) 옵션 데이터 구조 변환
      // 백엔드에서는 { optionId, optionValue } 형태로 오지만
      // 프론트에서는 Option { optionId, value } 형태로 사용하기 때문에 변환해줌.
      const mappedProduct: Product = {
        ...data,
        options: data.options?.map((opt: any) => ({
          optionId: opt.optionId,
          value: opt.optionValue,   // value 기반으로 통일
        })),
      };

      // 3) 상태 업데이트
      setProduct(mappedProduct);
    });
  }, [id]);  // id가 변경되면 다시 상세 조회

  // 커스텀 훅의 반환값: 정제된 상품 데이터
  return product;
}
