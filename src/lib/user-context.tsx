'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from './types';
import rawProfilesData from '../../data/profiles.json';

export type UserRole = 'TEACHER' | 'DEPT_HEAD' | 'PRINCIPAL' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  dept: string;
  email: string;
  employee_no?: string;
  phone?: string;
  extension_no?: string;
  homeroom_grade?: string;
  must_change_password?: boolean;
}

// 기본 역할별 대표 계정 (빠른 전환 및 초기값용)
export const USERS: Record<UserRole, UserProfile> = {
  TEACHER: {
    id: 'u8',
    name: '이재원',
    role: 'TEACHER',
    title: 'M8 담임교사 (중고등)',
    dept: '중고등',
    email: 'lis.jaelee@gmail.com',
    employee_no: 'LIS-2026-008',
    homeroom_grade: 'M8',
  },
  DEPT_HEAD: {
    id: 'u5',
    name: '황규문',
    role: 'DEPT_HEAD',
    title: '교감 (1차 결재권자)',
    dept: '중고등',
    email: 'kyumun.hwang@gmail.com',
    employee_no: 'LIS-2026-005',
    homeroom_grade: '',
  },
  PRINCIPAL: {
    id: 'u1',
    name: '김바울',
    role: 'PRINCIPAL',
    title: '교장 (최종 결재권자)',
    dept: '행정',
    email: 'jmlife0@gmail.com',
    employee_no: 'LIS-2026-001',
    homeroom_grade: '',
  },
  ADMIN: {
    id: 'u5',
    name: '황규문',
    role: 'ADMIN',
    title: '교감 / 총괄관리자 (최고관리자)',
    dept: '중고등',
    email: 'kyumun.hwang@gmail.com',
    employee_no: 'LIS-2026-005',
    homeroom_grade: '',
  },
};

// Profile 객체를 UserProfile로 변환
export function profileToUserProfile(profile: Profile): UserProfile {
  let role: UserRole = 'TEACHER';
  if (profile.primary_position_id === 'p1') {
    role = 'PRINCIPAL';
  } else if (profile.primary_position_id === 'p2') {
    role = 'DEPT_HEAD';
  } else if (profile.primary_role_id === 'r1' || profile.primary_role_id === 'r2') {
    role = 'ADMIN';
  }

  let deptName = '중고등';
  if (profile.primary_dept_id === 'd2') deptName = '행정';
  else if (profile.primary_dept_id === 'd6' || profile.primary_dept_id === 'd4') deptName = '초등';

  const homeroom = profile.homeroom_grade ? String(profile.homeroom_grade) : '';
  const title = profile.subject || (homeroom ? `${homeroom} 담임교사` : role === 'PRINCIPAL' ? '학교장' : role === 'DEPT_HEAD' ? '교감' : '교직원');

  return {
    id: profile.id,
    name: profile.name_kr,
    role,
    title,
    dept: deptName,
    email: profile.email,
    employee_no: profile.employee_no,
    phone: profile.phone,
    extension_no: profile.extension_no,
    homeroom_grade: homeroom,
    must_change_password: profile.must_change_password,
  };
}

interface UserContextType {
  currentUser: UserProfile;
  rawProfile: Profile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (profile: Profile) => void;
  logout: () => void;
  setCurrentUserRole: (role: UserRole) => void;
  isPasswordModalOpen: boolean;
  setIsPasswordModalOpen: (open: boolean) => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: USERS.TEACHER,
  rawProfile: null,
  isLoggedIn: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  setCurrentUserRole: () => {},
  isPasswordModalOpen: false,
  setIsPasswordModalOpen: () => {},
});

const STORAGE_KEY = 'lgs_intranet_logged_in_user';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(USERS.TEACHER);
  const [rawProfile, setRawProfile] = useState<Profile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Profile;
        // Verify against real profiles
        const allProfiles = rawProfilesData as unknown as Profile[];
        const matched = allProfiles.find((p) => p.email && p.email.toLowerCase() === parsed.email.toLowerCase()) || parsed;
        setRawProfile(matched);
        setCurrentUser(profileToUserProfile(matched));
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (profile: Profile) => {
    setRawProfile(profile);
    const user = profileToUserProfile(profile);
    setCurrentUser(user);
    setIsLoggedIn(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save session to localStorage:', e);
    }
  };

  const logout = () => {
    setRawProfile(null);
    setCurrentUser(USERS.TEACHER);
    setIsLoggedIn(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove session from localStorage:', e);
    }
  };

  const setCurrentUserRole = (role: UserRole) => {
    const targetUser = USERS[role];
    const allProfiles = rawProfilesData as unknown as Profile[];
    const matched = allProfiles.find((p) => p.id === targetUser.id);
    if (matched) {
      login(matched);
    } else {
      setCurrentUser(targetUser);
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        rawProfile,
        isLoggedIn,
        isLoading,
        login,
        logout,
        setCurrentUserRole,
        isPasswordModalOpen,
        setIsPasswordModalOpen,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
