"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
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
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUserState(null);
        return;
      }

      const data = await res.json();
      setUserState(data);
    } catch {
      setUserState(null);
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
