"use client";

import toast from "react-hot-toast";

export function showCartToast(router: any) {
  toast(
    <div className="flex flex-col gap-2">
      <p className="font-semibold">장바구니에 담았습니다 🛒</p>

      <button
        className="bg-black text-white rounded-md py-2 text-sm hover:bg-gray-800 cursor-pointer"
        onClick={() => {
          toast.dismiss();
          router.push("/mypage/cart");
        }}
      >
        장바구니로 이동
      </button>

      <button
        className="border border-gray-300 text-black rounded-md py-2 text-sm hover:bg-gray-200 cursor-pointer"
        onClick={() => toast.dismiss()}
      >
        쇼핑 계속하기
      </button>
    </div>
  );
}
