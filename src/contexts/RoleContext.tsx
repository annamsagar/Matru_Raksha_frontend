import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "patient" | "doctor" | "donor" | "admin" | "health_worker";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  setUserName: (name: string) => void;
}

// Bug #2 fix: Read persisted values from localStorage on init so a page refresh
// does not reset the role/username back to the hardcoded defaults.
const storedRole = (localStorage.getItem("userRole") as UserRole) || "doctor";
const storedName = localStorage.getItem("userName") || "";

const RoleContext = createContext<RoleContextType>({
  role: storedRole,
  setRole: () => {},
  userName: storedName,
  setUserName: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(storedRole);
  const [userName, setUserNameState] = useState(storedName);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("userRole", newRole);
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem("userName", name);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, userName, setUserName }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
