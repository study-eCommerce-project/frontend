"use client";
// 관리자 페이지에서 상품 추가하기 플러스 버튼 
import { useRouter } from "next/navigation";

export default function FabAddButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/admin/productNew")}
      className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full 
                 shadow-lg flex items-center justify-center hover:bg-blue-700 
                 transition-all duration-150 text-3xl"
    >
      +
    </button>
  );
}
