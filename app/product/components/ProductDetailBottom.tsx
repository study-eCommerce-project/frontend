"use client";

import { toFullUrl } from "@/lib/utils/toFullUrl";
import { useProductDetailTabs } from "@/hooks/useProductDetailTabs";

export default function ProductDetailBottom({ product }: any) {
  const {
    activeTab,
    infoRef,
    sizeRef,
    recommendRef,
    scrollToSection,
  } = useProductDetailTabs();

  /** subImages 절대경로 변환 */
  const subImages: string[] = (product.subImages || [])
    .map((img: string) => toFullUrl(img))
    .filter((v: string) => v);

  return (
    <div className="bg-white mt-20 rounded-xl shadow px-8 py-10 space-y-14 max-w-5xl mx-auto">

      {/* NAV */}
      <div className="sticky top-20 bg-white z-20 border-b">
        <div className="flex gap-10 text-lg font-semibold relative">

          {["info", "size", "recommend"].map((tab) => (
            <button
              key={tab}
              className={`
                group py-4 cursor-pointer transition-all
                ${activeTab === tab ? "text-black" : "text-gray-500 hover:text-black"}
              `}
              onClick={() => {
                if (tab === "info") scrollToSection(infoRef);
                if (tab === "size") scrollToSection(sizeRef);
                if (tab === "recommend") scrollToSection(recommendRef);
              }}
            >
              {tab === "info" && "정보"}
              {tab === "size" && "사이즈"}
              {tab === "recommend" && "추천"}

              <div
                className={`
                  h-[3px] w-full mt-2 transition-all origin-left
                  ${activeTab === tab ? "bg-black scale-x-100" : "scale-x-0 group-hover:scale-x-100 bg-gray-700"}
                `}
              />
            </button>
          ))}

        </div>
      </div>

      {/* 1. 정보 */}
      <section
        id="info"
        ref={infoRef}
        className="space-y-10 pt-6 flex flex-col items-center text-center"
      >
        <h2 className="text-2xl font-bold">제품 상세 정보</h2>

        <p className="text-gray-700 leading-relaxed max-w-3xl">
          클래식한 골프 무드와 빈티지 아카데미 감성을 결합한 
          <strong className="font-semibold">크림 & 그린 투톤 크루넥 스웻셔츠</strong>입니다.
        </p>

        {subImages[0] && (
          <img src={subImages[0]} className="w-full max-w-md rounded-xl" />
        )}
      </section>

      {/* 2. 사이즈 */}
      <section
        id="size"
        ref={sizeRef}
        className="space-y-10 pt-6 flex flex-col items-center text-center"
      >
        <h2 className="text-2xl font-bold">사이즈 정보</h2>

        <table className="w-full max-w-md border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">사이즈</th>
              <th>가슴단면</th>
              <th>어깨</th>
              <th>총기장</th>
              <th>소매길이</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">M</td><td>56cm</td><td>48cm</td><td>69cm</td><td>61cm</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">L</td><td>58cm</td><td>50cm</td><td>71cm</td><td>62cm</td>
            </tr>
            <tr>
              <td className="py-2">XL</td><td>60cm</td><td>52cm</td><td>73cm</td><td>63cm</td>
            </tr>
          </tbody>
        </table>

        {subImages[1] && (
          <img src={subImages[1]} className="w-full max-w-md rounded-xl" />
        )}
      </section>

      {/* 3. 추천 */}
      <section
        id="recommend"
        ref={recommendRef}
        className="space-y-10 pt-6 flex flex-col items-center text-center"
      >
        <h2 className="text-2xl font-bold">추천 상품</h2>

        {subImages[2] && (
          <img src={subImages[2]} className="w-full max-w-md rounded-xl" />
        )}
      </section>
    </div>
  );
}
