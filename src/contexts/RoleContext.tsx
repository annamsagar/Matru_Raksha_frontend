import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "doctor" | "donor" | "admin" | "health_worker";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  setUserName: (name: string) => void;
}

const RoleContext = createContext<RoleContextType>({
  role: "doctor",
  setRole: () => {},
  userName: "Dr. Sarah Mitchell",
  setUserName: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("doctor");
  const [userName, setUserName] = useState("Dr. Sarah Mitchell");

  return (
    <RoleContext.Provider value={{ role, setRole, userName, setUserName }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
