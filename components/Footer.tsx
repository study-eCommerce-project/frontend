import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        {/* 회사/서비스 정보 */}
        <div>
          <h3 className="text-lg font-semibold mb-2">E-Commerce</h3>
          <p className="text-gray-400 text-sm">
            여러분의 쇼핑과 즐거운 경험을 한 곳에서 제공합니다.
          </p>
        </div>

        {/* 빠른 링크 */}
        <div>
          <h3 className="text-lg font-semibold mb-2">빠른 링크</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>
              <Link href="/" className="hover:text-white transition">
                홈
              </Link>
            </li>
            <li>
              <Link href="/mypage" className="hover:text-white transition">
                마이페이지
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white transition">
                장바구니
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-white transition">
                검색
              </Link>
            </li>
          </ul>
        </div>

        {/* 연락처 / SNS */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Contact & SNS</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>Email: support@ecommerce.com</li>
            <li>Phone: 010-1234-5678</li>
            <li>
              <Link href="#" className="hover:text-white transition">
                Facebook
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition">
                Instagram
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-4">
        <p className="text-center text-gray-500 text-sm py-4">
          &copy; {new Date().getFullYear()} E-Commerce. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
