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
    id: 'u8',
    name: '이재원',
    role: 'TEACHER',
    title: 'M8 담임교사',
    dept: '중고등',
    email: 'lis.jaelee@gmail.com',
  },
  DEPT_HEAD: {
    id: 'u5',
    name: '황규문',
    role: 'DEPT_HEAD',
    title: '중고등교감 (1차 결재권자)',
    dept: '중고등',
    email: 'kyumun.hwang@gmail.com',
  },
  PRINCIPAL: {
    id: 'u1',
    name: '김바울',
    role: 'PRINCIPAL',
    title: '교장 (최종 결재권자)',
    dept: '행정',
    email: 'jmlife0@gmail.com',
  },
  ADMIN: {
    id: 'u5',
    name: '황규문',
    role: 'ADMIN',
    title: '교감 / 총괄관리자 (최고관리자)',
    dept: '중고등',
    email: 'kyumun.hwang@gmail.com',
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
