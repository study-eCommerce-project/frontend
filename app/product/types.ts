// types.ts
export interface Option {
  optionId: number;
  optionValue: string;
  sellPrice: number;
  stock: number;
  optionType?: string;
  optionTitle?: string;
}

export interface SelectedOption {
  optionId: number;
  value: string;
  count: number;
  price: number;
}

export interface Product {
  productId: number;
  productName: string;
  description?: string;
  mainImg?: string;
  subImages?: string[];
  consumerPrice?: number;
  sellPrice: number;
  stock: number;
  isOption?: number;
  options?: Option[];
  categoryPath: string;
  likeCount?: number;
  userLiked?: boolean;
}
