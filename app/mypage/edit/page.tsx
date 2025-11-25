"use client";

import { useState, useEffect } from "react";

interface UserInfo {
  password: string;
  phone: string;
}

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  detail: string;
  isDefault: boolean;
}

export default function MyInfoPage() {
  const [user, setUser] = useState<UserInfo>({
    password: "",
    phone: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    detail: "",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("myInfo");
    const savedAddresses = localStorage.getItem("myAddresses");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedAddresses) setAddresses(JSON.parse(savedAddresses));
  }, []);

  const handleUserChange = (field: keyof UserInfo, value: string) => {
    setUser({ ...user, [field]: value });
  };

  const handleSaveUser = () => {
    if (!user.password || !user.phone) {
      alert("비밀번호와 전화번호는 필수 입력입니다.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("myInfo", JSON.stringify(user));
      setLoading(false);
      alert("내 정보가 저장되었습니다!");
    }, 400);
  };

  const addAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address) {
      alert("이름, 전화번호, 주소는 필수입니다.");
      return;
    }

    const next = [
      ...addresses,
      {
        id: Date.now(),
        ...newAddress,
        isDefault: addresses.length === 0,
      },
    ];

    setAddresses(next);
    localStorage.setItem("myAddresses", JSON.stringify(next));

    setNewAddress({ name: "", phone: "", address: "", detail: "" });
    alert("배송지가 성공적으로 추가되었습니다!");
  };

  const setDefaultAddress = (id: number) => {
    const updated = addresses.map((a) =>
      a.id === id ? { ...a, isDefault: true } : { ...a, isDefault: false }
    );

    setAddresses(updated);
    localStorage.setItem("myAddresses", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">내 정보 관리</h1>
        </div>

        {/* 내 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">내 정보</h2>

          <div className="space-y-4">

            {/* 비밀번호 */}
            <div>
              <label className="font-medium">비밀번호</label>
              <input
                type="password"
                value={user.password}
                onChange={(e) => handleUserChange("password", e.target.value)}
                className="w-full mt-1 border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 전화번호 */}
            <div>
              <label className="font-medium">전화번호</label>
              <input
                type="text"
                value={user.phone}
                onChange={(e) => handleUserChange("phone", e.target.value)}
                className="w-full mt-1 border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSaveUser}
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold cursor-pointer ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>

        {/* 배송지 목록 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">배송지 목록</h2>

          {addresses.length === 0 && (
            <p className="text-gray-500">등록된 배송지가 없습니다.</p>
          )}

          <div className="space-y-4">
            {addresses.map((a) => (
              <div
                key={a.id}
                className="border rounded-xl p-4 flex justify-between bg-gray-50"
              >
                <div className="space-y-1">
                  <p className="font-bold">{a.name}</p>
                  <p className="text-gray-600">{a.phone}</p>
                  <p className="text-gray-600">
                    {a.address} {a.detail}
                  </p>
                </div>

                <div className="flex flex-col justify-between items-end">
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      a.isDefault
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {a.isDefault ? "기본배송지" : "보조"}
                  </span>

                  {!a.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(a.id)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      기본으로 설정
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 배송지 추가 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">배송지 추가</h2>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="이름"
              value={newAddress.name}
              onChange={(e) =>
                setNewAddress({ ...newAddress, name: e.target.value })
              }
              className="w-full border rounded px-4 py-2"
            />
            <input
              type="text"
              placeholder="전화번호"
              value={newAddress.phone}
              onChange={(e) =>
                setNewAddress({ ...newAddress, phone: e.target.value })
              }
              className="w-full border rounded px-4 py-2"
            />
            <input
              type="text"
              placeholder="주소"
              value={newAddress.address}
              onChange={(e) =>
                setNewAddress({ ...newAddress, address: e.target.value })
              }
              className="w-full border rounded px-4 py-2"
            />
            <input
              type="text"
              placeholder="상세주소"
              value={newAddress.detail}
              onChange={(e) =>
                setNewAddress({ ...newAddress, detail: e.target.value })
              }
              className="w-full border rounded px-4 py-2"
            />

            <button
              onClick={addAddress}
              className="w-full bg-green-600 text-white rounded-lg py-3 font-semibold hover:bg-green-700 cursor-pointer"
            >
              배송지 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
