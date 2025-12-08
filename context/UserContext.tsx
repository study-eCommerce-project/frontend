"use client";

import axios from "@/context/axiosConfig";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL; 

  const [user, setUserState] = useState<User | null>(null);

  /** User 상태 업데이트 (로컬스토리지 금지) */
  const setUser = (data: User | null) => {
    setUserState(data);
  };

  /** 세션 기반 로그인 복원 */
  const refreshUser = async () => {
    try {
      // axios로 수정: API_URL을 환경변수로 처리
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true, // 쿠키를 포함한 요청 (세션 유지)
      });
      setUserState(res.data);

    } catch (err: any) {
      if (err.response?.status === 401) {
      // 401이면 axiosConfig가 자동 로그아웃 + redirect
        setUserState(null);
      } else {
      console.error("auth check error", err);
      }
    }
  };

  /** 첫 로드시 세션 기반 로그인 체크 */
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
