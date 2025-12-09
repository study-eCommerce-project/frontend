// 관리자용 상품 타입 (product table + category_link.category_code 기준)
export interface AdminProduct {
  productId?: number;         // product_id
  productName: string;        // product_name
  description?: string;       // description
  consumerPrice?: number;     // consumer_price
  sellPrice: number;          // sell_price (기본 판매가)
  stock: number;              // stock (단일 상품일 때 유의미)
  isOption: boolean;          // is_option (true = 옵션 상품, false = 단품)
  mainImg: string;           // main_img
  subImages?: {         // subImages를 선택적 배열로 정의
    imageUrl: string;
    sortOrder: number;
    productId: number;
  }[];       
  productStatus: number;      // product_status (10,20,21,40,90 등)
  isShow: boolean;            // is_show

  categoryCode?: string;      // category_link.category_code

  options: AdminProductOption[]; // 옵션 상품일 경우 옵션 목록
  totalStock?: number;

  // AI 상세 블록 
  blocks?: {
    type: "text" | "image";
    content?: string;
    url?: string;
  }[];
  // 백엔드 옵션 삭제용 
  deleteOptionIds?: number[];
}

// AI 상품 설명 자동 생성을 위한 서브 이미지
export interface ProductBlock {
  type: "text" | "image";
  content?: string;
  url?: string;
}

// 관리자용 상품 옵션 타입 (product_option table 기준)
export interface AdminProductOption {
  optionId?: number;          // option_id (수정 시에만 필요)
  optionType: "N" | "C";      // 옵션 타입: N = 일반, C = 색상
  optionTitle: string;        // 옵션 제목: 예) 색상, 사이즈
  optionValue: string;        // 옵션 값: 예) 블랙, S, M
  // 관리자 입력값
  extraPrice: number;     // 옵션 추가금 (프론트/비즈니스용)
  
  sellPrice?: number;          // 옵션별 판매가 (없으면 0 => 기본 판매가 그대로 사용)
  stock: number;              // 해당 옵션 재고
  isShow: boolean;            // 옵션 노출 여부
  colorCode?: string;         // 색상 코드 (#FF0000 등, 색상 옵션일 때만 사용 가능)
  consumerPrice?: number;     // 옵션 소비자가(필요 없으면 사용 안 해도 됨)
}

export interface ProductImage {
  imageUrl: string;   // 이미지 URL
  sortOrder: number;  // 이미지 정렬 순서
  productId: number;  // 연결된 상품 ID
}
