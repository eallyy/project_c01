"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { SessionUser } from "@/lib/session";

type UserContextType = {
  user: SessionUser | null;
  setUser: (u: SessionUser) => void;
  refreshSession: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  refreshSession: async () => {},
});

export function UserProvider({ children, initialUser }: { children: ReactNode; initialUser: SessionUser }) {
  const [user, setUser] = useState<SessionUser>(initialUser);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } 
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshSession: refreshSession }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
