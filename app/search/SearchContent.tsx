"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchContent() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const params = useSearchParams();
  const keyword = params.get("keyword");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!keyword) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/searchItems?query=${encodeURIComponent(keyword)}`);
        const data = await res.json();
        setResults(data.items || []);
      } catch (error) {
        console.error("검색 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [keyword]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          “<span className="text-blue-600">{keyword}</span>” 검색 결과
        </h2>

        {loading && <p className="text-gray-700 text-center py-10">검색 중입니다...</p>}

        {!loading && results.length === 0 && (
          <p className="text-xl text-gray-700 text-center mt-50 py-10">검색 결과가 없습니다.</p>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {results.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-40 object-contain mb-3"
                />
                <p
                  className="text-gray-800 text-center text-sm font-medium mb-1 line-clamp-2 h-10"
                  dangerouslySetInnerHTML={{ __html: item.title }}
                />
                <p className="text-blue-600 font-bold">{item.lprice.toLocaleString()}원</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
