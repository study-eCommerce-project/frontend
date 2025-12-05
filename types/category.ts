//관리자 상품 수정 등록 페이지 카테고리 선택 

export interface CategoryTree {
  [bigCode: string]: {
    title: string;
    children: {
      [midCode: string]: {
        title: string;
        children: {
          [leafCode: string]: string;
        };
      };
    };
  };
}
