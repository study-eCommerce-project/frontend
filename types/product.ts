/**
 * 옵션 기본 타입
 *
 * - optionId : 옵션 고유 ID
 * - value    : 옵션 표시 텍스트 (ex: "블랙", "L", "250mm")
 *
 * ※ 백엔드에서는 optionValue로 전달되지만,
 *   useProductDetail 훅에서 value 로 변환하여 일관된 구조로 사용함.
 */
export interface Option {
  optionId: number;
  value: string;  // 옵션 이름(문구)
}

/**
 * 사용자가 선택한 옵션 타입
 *
 * - Option을 기반으로 count(수량)만 추가됨
 * - UI에서 옵션의 수량 증가/감소/삭제할 때 사용
 */
export interface SelectedOption extends Option {
  count: number;
}

/**
 * Product (상품 전체 타입)
 *
 * 사용처:
 * - 리스트 페이지(Category/Product List)
 * - 상세 페이지(Product Detail)
 *
 * 특징:
 * - 공통 필드는 필수(required)
 * - 상세 정보에서만 필요한 내용은 optional 처리
 */

export interface Product {
  /** 공통 필드 (리스트/상세 공통) */
  productId: number;      // 상품 ID
  productName: string;    // 상품명
  sellPrice: number;      // 판매가
  stock: number;          // 재고
  mainImg?: string;       // 대표 이미지 URL

  /** 상세 페이지 전용 필드 (optional) */
  subImages?: string[];    // 상세 이미지 목록
  consumerPrice?: number;  // 원가(정가)
  isOption?: number;       // 옵션 여부 (1 = 옵션 있음)
  options?: Option[];      // 옵션 리스트
  categoryPath?: string;   // 카테고리 경로 (ex: "상의 > 후드티")
  likeCount?: number;      // 좋아요 수
  userLiked?: boolean;     // 현재 로그인한 사용자가 좋아요 눌렀는지
}
