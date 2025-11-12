"use client";
import { useUser } from "../../context/UserContext";
import Link from "next/link";

export default function MyPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">마이페이지</h1>

        {user ? (
          <div className="space-y-4">
            <p className="text-gray-700 text-lg font-medium">
              {user.user_name}님 환영합니다
            </p>

            <div className="flex gap-3">
              <Link
                href="/cart"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
              >
                장바구니 보기
              </Link>

              <Link
                href="/"
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                홈으로
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-lg">
            로그인 후 이용 가능합니다.{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              로그인 하기 →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
