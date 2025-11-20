"use client";

import { useEffect, useRef, useState } from "react";

export default function ProductDetailBottom({ product }: any) {
  const [activeTab, setActiveTab] = useState("info");

  const infoRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const recommendRef = useRef<HTMLDivElement>(null);

  const subImages = product.subImages || [];

  const scrollToSection = (ref: any) => {
    const offset = 120; // 원하는 만큼 조절
    const top = ref.current!.offsetTop - offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };


  // ScrollSpy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveTab(e.target.id);
        });
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    [infoRef, sizeRef, recommendRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white mt-20 rounded-xl shadow px-8 py-10 space-y-14">

      {/* ----------------------------- */}
      {/* NAV TABS (하얀박스 내부 고정) */}
      {/* ----------------------------- */}
      <div className="sticky top-20 bg-white z-20 border-b">
        <div className="flex gap-10 text-lg font-semibold relative">

          {["info", "size", "recommend"].map((tab) => (
            <button
              key={tab}
              className={`py-4 transition-colors ${
                activeTab === tab ? "text-blue-600" : "text-gray-500"
              }`}
              onClick={() => {
                if (tab === "info") scrollToSection(infoRef);
                if (tab === "size") scrollToSection(sizeRef);
                if (tab === "recommend") scrollToSection(recommendRef);
              }}
            >
              {tab === "info" && "정보"}
              {tab === "size" && "사이즈"}
              {tab === "recommend" && "추천"}

              {/* 파란 underline */}
              <div
                className={`h-[3px] w-full mt-2 transition-all ${
                  activeTab === tab ? "bg-blue-600" : "bg-transparent"
                }`}
              />
            </button>
          ))}

        </div>
      </div>

      {/* ----------------------------- */}
      {/* 1. 정보 섹션 */}
      {/* ----------------------------- */}
      <section id="info" ref={infoRef} className="space-y-10 pt-6">

        <h2 className="text-2xl font-bold">제품 상세 정보</h2>

        <p className="text-gray-700 leading-relaxed">
          클래식한 골프 무드와 빈티지 아카데미 감성을 결합한  
          <strong className="font-semibold">크림 & 그린 투톤 크루넥 스웻셔츠</strong>입니다.
          부드러운 코튼 기반 원단으로 제작되어 일상과 가벼운 아웃도어 모두 아우르는
          활용도가 높은 아이템입니다.
        </p>

        <ul className="list-disc pl-5 text-gray-700">
          <li>1960’s 빈티지 무드의 아치 로고 자수</li>
          <li>넥/소매/밑단 탄탄한 립 짜임</li>
          <li>적당히 여유로운 레귤러 핏</li>
          <li>캡/양말 등과 코디하면 더 완성도 있는 스타일링 가능</li>
        </ul>

        {/* 이미지: subImages[0] */}
        {subImages[0] && <img src={subImages[0]} className="w-full rounded-xl" />}

        <h3 className="text-xl font-bold pt-6">스타일링 포인트</h3>
        <p className="text-gray-700 leading-relaxed">
          크림 베이스의 톤과 딥그린 포인트 컬러가 자연스럽게 조화되어  
          골프웨어, 캠퍼스룩, 캐주얼 데일리룩까지 폭넓게 연출할 수 있습니다.
        </p>

        {/* 이미지: subImages[1] */}
        {subImages[1] && <img src={subImages[1]} className="w-full rounded-xl" />}

      </section>

      {/* ----------------------------- */}
      {/* 2. 사이즈 섹션 */}
      {/* ----------------------------- */}
      <section id="size" ref={sizeRef} className="space-y-10 pt-6">

        <h2 className="text-2xl font-bold">사이즈 정보</h2>

        <p className="text-gray-700">
          편안하게 떨어지는 레귤러 핏이며, 평소 착용하는 사이즈 기준으로 선택하면 됩니다.
        </p>

        <table className="w-full border-collapse text-left">
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
              <td className="py-2">M</td>
              <td>56cm</td><td>48cm</td><td>69cm</td><td>61cm</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">L</td>
              <td>58cm</td><td>50cm</td><td>71cm</td><td>62cm</td>
            </tr>
            <tr>
              <td className="py-2">XL</td>
              <td>60cm</td><td>52cm</td><td>73cm</td><td>63cm</td>
            </tr>
          </tbody>
        </table>

        {/* 이미지: subImages[2] */}
        {subImages[2] && <img src={subImages[2]} className="w-full rounded-xl" />}

      </section>

      {/* ----------------------------- */}
      {/* 3. 추천 섹션 */}
      {/* ----------------------------- */}
      <section id="recommend" ref={recommendRef} className="space-y-10 pt-6">

        <h2 className="text-2xl font-bold">추천 상품</h2>
        <p className="text-gray-700">
          유사한 무드의 빈티지 스포티 아이템들을 추천드립니다.
        </p>

        {/* subImages[3] */}
        {subImages[3] && <img src={subImages[3]} className="w-full rounded-xl" />}

      </section>
    </div>
  );
}
