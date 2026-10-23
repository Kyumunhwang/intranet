'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'TEACHER' | 'DEPT_HEAD' | 'PRINCIPAL' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  dept: string;
  email: string;
}

export const USERS: Record<UserRole, UserProfile> = {
  TEACHER: {
    id: 'u2',
    name: '김교사',
    role: 'TEACHER',
    title: '중3-2 담임 · 과학교과',
    dept: '중고등부',
    email: 'kim.teacher@lighthouse.org',
  },
  DEPT_HEAD: {
    id: 'u4',
    name: '박교무',
    role: 'DEPT_HEAD',
    title: '교무부장 (1차 결재권자)',
    dept: '교무부',
    email: 'park.head@lighthouse.org',
  },
  PRINCIPAL: {
    id: 'u3',
    name: '이교장',
    role: 'PRINCIPAL',
    title: '교장 (최종 결재권자)',
    dept: '교장실',
    email: 'lee.principal@lighthouse.org',
  },
  ADMIN: {
    id: 'u1',
    name: '정총괄',
    role: 'ADMIN',
    title: '행정실장 (최고관리자)',
    dept: '행정실',
    email: 'admin@lighthouse.org',
  },
};

interface UserContextType {
  currentUser: UserProfile;
  setCurrentUserRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: USERS.TEACHER,
  setCurrentUserRole: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('TEACHER');

  return (
    <UserContext.Provider
      value={{
        currentUser: USERS[currentRole],
        setCurrentUserRole: setCurrentRole,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
