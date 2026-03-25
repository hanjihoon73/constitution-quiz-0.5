'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { User as DbUser } from '@/types/database';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    dbUser: DbUser | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    refreshDbUser: () => Promise<void>;
    isDbUserLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [dbUser, setDbUser] = useState<DbUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDbUserLoaded, setIsDbUserLoaded] = useState(false);
    const isInitialized = useRef(false);

    const supabase = createClient();

    const fetchDbUser = async (authUser: User) => {
        try {
            // 1. 먼저 provider_id로 사용자 조회
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('provider_id', authUser.id)
                .single();

            if (error) {
                // PGRST116 = "Row not found" → 진짜로 DB에 없는 유저 (신규 → 온보딩 대상)
                if (error.code === 'PGRST116') {
                    setDbUser(null);
                    setIsDbUserLoaded(true);
                    return;
                }
                // 그 외 에러(네트워크, 타임아웃, 탭 동기화 AbortError 등)는 무시
                // → 기존에 로드된 dbUser가 있으면 그대로 유지
                return;
            }

            if (data) {
                // 2. auth_id가 없거나 다르면 업데이트 (RLS 정책 호환성)
                if (data.auth_id !== authUser.id) {
                    await supabase
                        .from('users')
                        .update({ auth_id: authUser.id })
                        .eq('id', data.id);

                    setDbUser({ ...data, auth_id: authUser.id });
                } else {
                    setDbUser(data);
                }
            } else {
                setDbUser(null);
            }
            setIsDbUserLoaded(true);
        } catch {
            // fetch 실패 시에도 isDbUserLoaded는 true로 설정
            // → 무한 로딩 방지 (기존 dbUser 데이터는 유지)
            setIsDbUserLoaded(true);
        }
    };

    // DB 사용자 정보 새로고침
    const refreshDbUser = async () => {
        if (user) {
            await fetchDbUser(user);
        }
    };

    // 로그아웃
    const signOut = async () => {
        if (user && dbUser) {
            await supabase.from('user_login_history').insert({
                user_id: dbUser.id,
                provider: dbUser.provider,
                action: 'logout'
            });
        }
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setDbUser(null);
        setIsDbUserLoaded(false);
    };

    useEffect(() => {
        // 초기 세션 확인 (최초 1회만 실행되어 isLoading 해제 담당)
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchDbUser(session.user);
                } else {
                    // 세션 없으면 isDbUserLoaded도 완료로 설정 (비로그인 상태)
                    setIsDbUserLoaded(true);
                }

                isInitialized.current = true;
                setIsLoading(false);
            } catch {
                // getSession 실패(세션 타임아웃, AbortError 등) 시에도
                // isLoading을 해제하여 무한 로딩 방지
                isInitialized.current = true;
                setIsLoading(false);
                setIsDbUserLoaded(true);
            }
        };

        initializeAuth();

        // 인증 상태 변경 리스너 (초기화 완료 이후 변경사항만 처리)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // INITIAL_SESSION은 initializeAuth에서 처리하므로 무시
                if (!isInitialized.current) {
                    return;
                }

                setSession(session);
                setUser(session?.user ?? null);

                if (event === 'SIGNED_OUT') {
                    // 명시적 로그아웃 시에만 상태 완전 초기화
                    setDbUser(null);
                    setIsDbUserLoaded(false);
                } else if (session?.user) {
                    // TOKEN_REFRESHED, SIGNED_IN 등: DB 사용자 정보 갱신
                    await fetchDbUser(session.user);
                }
                // 그 외 (세션이 일시적으로 null인 경우): 기존 dbUser 유지 → 무한 로딩 방지
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                dbUser,
                isLoading,
                signOut,
                refreshDbUser,
                isDbUserLoaded
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
