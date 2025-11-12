"use client";

import Image from "next/image";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateCount } = useCart();

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.count,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">장바구니</h1>

        {cart.length === 0 ? (
          <p className="text-gray-600 text-lg text-center py-10">
            장바구니가 비어있습니다.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4"
                >
                  <div className="flex items-center gap-4">
                    {item.thumbnailUrl && (
                      <Image
                        src={`/images/${item.thumbnailUrl}`}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                    )}

                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {item.price.toLocaleString()}원
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateCount(item.id, Math.max(1, item.count - 1))
                          }
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="text-sm font-semibold">
                          {item.count}
                        </span>
                        <button
                          onClick={() => updateCount(item.id, item.count + 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <p className="text-gray-800 font-semibold mb-2">
                      {(item.price * item.count).toLocaleString()}원
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 mt-6 pt-6 flex justify-between items-center">
              <p className="text-xl font-semibold text-gray-800">총 합계</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalPrice.toLocaleString()}원
              </p>
            </div>

            <button className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              주문하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
