"use client";
import { createContext, useContext, useEffect, useState } from "react";

type User = { user_name: string } | null;

const UserContext = createContext<{
  user: User;
  setUser: (user: User) => void;
}>({
  user: null,
  setUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("user_name"); // ✅ sessionStorage 사용
    if (stored) setUser({ user_name: stored });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
