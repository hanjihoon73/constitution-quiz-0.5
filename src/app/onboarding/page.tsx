'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth';
import { MobileFrame } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// 닉네임 유효성 검사 정규식 (2-10자, 한글/영문/숫자만)
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;

export default function OnboardingPage() {
    const router = useRouter();
    const { user, dbUser, isLoading } = useAuth();
    const supabase = createClient();

    const [nickname, setNickname] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // 이미 등록된 사용자는 홈으로 리다이렉트
    useEffect(() => {
        if (!isLoading && dbUser) {
            router.push('/');
        }
    }, [isLoading, dbUser, router]);

    // 닉네임 유효성 검사
    const validateNickname = (value: string) => {
        if (!value) {
            return '닉네임을 입력해주세요.';
        }
        if (value.length < 2) {
            return '닉네임은 2자 이상이어야 합니다.';
        }
        if (value.length > 10) {
            return '닉네임은 10자 이하여야 합니다.';
        }
        if (!NICKNAME_REGEX.test(value)) {
            return '한글, 영문, 숫자만 사용할 수 있습니다.';
        }
        return '';
    };

    // 닉네임 중복 검사
    const checkDuplicate = async (value: string) => {
        const { data, error } = await supabase
            .from('users')
            .select('nickname')
            .eq('nickname', value)
            .maybeSingle();

        if (error) {
            console.error('중복 검사 에러:', error);
            return false;
        }

        return data !== null;
    };

    // 닉네임 입력 핸들러
    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNickname(value);
        setError(validateNickname(value));
    };

    // 닉네임 확정 핸들러
    const handleSubmit = async () => {
        // 유효성 검사
        const validationError = validateNickname(nickname);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsChecking(true);

        // 중복 검사
        const isDuplicate = await checkDuplicate(nickname);
        if (isDuplicate) {
            setError('이미 사용 중인 닉네임입니다.');
            setIsChecking(false);
            return;
        }

        setIsChecking(false);
        setIsSubmitting(true);

        try {
            if (!user) {
                throw new Error('로그인 정보가 없습니다.');
            }

            console.log('[온보딩] user 정보:', {
                id: user.id,
                provider: user.app_metadata.provider,
                email: user.email
            });

            // users 테이블에 사용자 정보 저장
            const insertPayload = {
                provider_id: user.id,
                provider: user.app_metadata.provider as 'google' | 'kakao',
                nickname: nickname,
                role: 'user' as const,
            };

            console.log('[온보딩] Insert payload:', insertPayload);

            const { data, error: insertError } = await supabase
                .from('users')
                .insert(insertPayload)
                .select();

            console.log('[온보딩] Insert 응답:', { data, error: insertError });

            if (insertError) {
                console.error('[온보딩] Insert 에러 발생!');
                console.error('- message:', insertError.message);
                console.error('- code:', insertError.code);
                console.error('- details:', insertError.details);
                console.error('- hint:', insertError.hint);
                throw insertError;
            }

            // 저장 성공! 전체 페이지를 새로고침하여 AuthProvider가 dbUser를 확실히 로드하도록 함
            console.log('[온보딩] 저장 성공! 홈으로 이동');
            toast.success('환영합니다! 🎉');

            // router.push 대신 window.location.href 사용 (전체 페이지 새로고침)
            // 이렇게 해야 AuthProvider가 완전히 새로 초기화되어 dbUser를 가져옴
            window.location.href = '/';
        } catch (err) {
            console.error('저장 에러:', err);
            console.error('에러 상세:', JSON.stringify(err, null, 2));

            // Supabase 에러인 경우 더 자세한 정보 출력
            if (err && typeof err === 'object' && 'message' in err) {
                console.error('에러 메시지:', (err as any).message);
                console.error('에러 코드:', (err as any).code);
                console.error('에러 세부:', (err as any).details);
            }

            toast.error('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MobileFrame className="bg-gradient-to-b from-white to-gray-50">
            <div className="flex flex-1 flex-col items-center justify-center px-6">
                {/* BI 로고 */}
                <div className="mb-8">
                    <Image
                        src="/bi-constitution-quiz-symbol.svg"
                        alt="모두의 헌법"
                        width={80}
                        height={80}
                        priority
                    />
                </div>

                {/* 환영 메시지 */}
                <h1 className="mb-2 text-2xl font-bold text-primary">
                    환영합니다!
                </h1>
                <p className="mb-8 text-center text-gray-500">
                    퀴즈에서 사용할 닉네임을<br />입력해주세요.
                </p>

                {/* 닉네임 입력 폼 */}
                <div className="w-full max-w-[320px] space-y-4">
                    <div>
                        <Input
                            type="text"
                            placeholder="닉네임 (2-10자)"
                            value={nickname}
                            onChange={handleNicknameChange}
                            maxLength={10}
                            className={`h-12 rounded-xl text-center text-lg ${error ? 'border-red-500 focus-visible:ring-red-500' : ''
                                }`}
                        />
                        {error && (
                            <p className="mt-2 text-center text-sm text-red-500">{error}</p>
                        )}
                        <p className="mt-2 text-center text-xs text-gray-400">
                            한글, 영문, 숫자 사용 가능
                        </p>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={!nickname || !!error || isChecking || isSubmitting}
                        className="h-12 w-full rounded-xl bg-secondary text-white font-semibold hover:bg-secondary/90"
                    >
                        {isChecking ? '확인 중...' : isSubmitting ? '저장 중...' : '시작하기'}
                    </Button>
                </div>
            </div>
        </MobileFrame>
    );
}
