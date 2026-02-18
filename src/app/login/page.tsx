'use client';

import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { MobileFrame } from '@/components/common';

export default function LoginPage() {
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const handleKakaoLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <MobileFrame className="bg-gradient-to-b from-white to-gray-50">
            <div className="flex flex-1 flex-col items-center justify-center px-6">
                {/* BI 로고 영역 */}
                <div className="mb-8 flex flex-col items-center">
                    <Image
                        src="/bi-constitution-quiz-vertical.svg"
                        alt="모두의 헌법"
                        width={180}
                        height={120}
                        priority
                    />
                </div>

                {/* 슬로건 */}
                <p className="mb-12 text-center text-gray-500">
                    퀴즈로 즐기는 재미있는 헌법 상식
                </p>

                {/* 로그인 버튼 영역 */}
                <div className="w-full max-w-[320px] space-y-3">
                    {/* Google 로그인 */}
                    <Button
                        onClick={handleGoogleLogin}
                        variant="outline"
                        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border-gray-200 bg-white font-medium shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span>Google로 계속하기</span>
                    </Button>

                    {/* Kakao 로그인 */}
                    <Button
                        onClick={handleKakaoLogin}
                        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl font-medium shadow-sm transition-all hover:shadow-md"
                        style={{ backgroundColor: '#FEE500', color: '#000000' }}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                fill="#000000"
                                d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.018 5.922l-.693 2.554a.5.5 0 0 0 .762.54l3.08-2.053c.91.15 1.852.23 2.833.23 5.523 0 10-3.477 10-7.693C22 6.477 17.523 3 12 3z"
                            />
                        </svg>
                        <span>카카오로 계속하기</span>
                    </Button>
                </div>

                {/* 약관 동의 안내 */}
                <p className="mt-8 text-center text-xs text-gray-400">
                    로그인 시{' '}
                    <span className="underline">이용약관</span> 및{' '}
                    <span className="underline">개인정보처리방침</span>에<br />
                    동의하는 것으로 간주됩니다.
                </p>

                {/* 저작권 문구 */}
                <p className="mt-6 text-center text-xs text-gray-300">
                    ⓒ 2025 COGNITY. All rights reserved.
                </p>
            </div>
        </MobileFrame>
    );
}
