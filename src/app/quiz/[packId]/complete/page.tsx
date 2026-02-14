'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MobileFrame } from '@/components/common';
import { useAuth } from '@/components/auth';
import { getUserQuizProgress, updateQuizpackStatistics, saveQuizpackRating, unlockNextQuizpack, resetUserQuizpack, getUserQuizpackId } from '@/lib/api/quiz';
import { Star, Clock } from 'lucide-react';

interface QuizResult {
    totalQuizCount: number;
    correctCount: number;
    incorrectCount: number;
    correctRate: number;
    totalTimeSeconds: number;
}

export default function QuizCompletePage() {
    const params = useParams();
    const router = useRouter();
    const packId = Number(params.packId);
    const { dbUser } = useAuth();

    const [result, setResult] = useState<QuizResult | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 퀴즈 결과 로드
    useEffect(() => {
        async function loadResult() {
            if (!dbUser?.id) return;

            try {
                const progress = await getUserQuizProgress(dbUser.id, packId);
                if (progress) {
                    setResult({
                        totalQuizCount: progress.total_quiz_count || 0,
                        correctCount: progress.correct_count || 0,
                        incorrectCount: progress.incorrect_count || 0,
                        correctRate: progress.correct_rate || 0,
                        totalTimeSeconds: progress.total_time_seconds || 0,
                    });
                }
            } catch (error) {
                console.error('결과 로드 에러:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadResult();
    }, [dbUser?.id, packId]);

    // 통계/평점 저장 후 이동
    const handleSaveAndNavigate = useCallback(async (destination: 'next' | 'home') => {
        if (!dbUser?.id || !result) return;

        setIsSaving(true);
        try {
            // 1. 퀴즈팩 통계 업데이트
            await updateQuizpackStatistics(
                packId,
                result.correctCount,
                result.totalQuizCount
            );

            // 2. 평점 저장 (선택한 경우에만)
            if (rating > 0) {
                await saveQuizpackRating(dbUser.id, packId, rating);
            }

            // 3. 다음 퀴즈팩 해금 및 이동 처리
            if (destination === 'next') {
                // 다음 퀴즈팩 해금 시도
                const nextPackId = await unlockNextQuizpack(dbUser.id, packId);

                if (nextPackId) {
                    // 다음 퀴즈팩이 있으면 이동
                    router.push(`/quiz/${nextPackId}`);
                } else {
                    // 다음 퀴즈팩이 없으면 (마지막 퀴즈팩 완료)
                    // 전면 광고나 축하 파티클 등을 보여줄 수도 있겠지만, 여기서는 홈으로 이동하며 파라미터 전달
                    router.push('/?allClear=true');
                }
            } else {
                // 홈으로 이동 시에도 마지막 퀴즈팩 여부 확인
                const nextPackId = await unlockNextQuizpack(dbUser.id, packId);
                if (!nextPackId) {
                    // 마지막 퀴즈팩이었으면 allClear 팝업 표시
                    router.push('/?allClear=true');
                } else {
                    router.push('/');
                }
            }
        } catch (error) {
            console.error('저장 에러:', error);
            // 에러가 있어도 일단 홈으로 이동 (데이터 불일치 방지 위해 안전한 선택)
            router.push('/');
        }
    }, [dbUser?.id, packId, result, rating, router]);

    // 다음 퀴즈팩으로 이동
    const handleNextQuizpack = () => {
        handleSaveAndNavigate('next');
    };

    // 홈으로 이동
    const handleGoHome = () => {
        handleSaveAndNavigate('home');
    };

    // 결과보기 핸들러
    const handleViewResults = useCallback(() => {
        router.push(`/quiz/${packId}?mode=view`);
    }, [packId, router]);

    // 다시풀기 핸들러
    const handleRestart = useCallback(async () => {
        if (!dbUser?.id) return;

        try {
            const userQuizpackId = await getUserQuizpackId(dbUser.id, packId);
            if (userQuizpackId) {
                await resetUserQuizpack(userQuizpackId);
            }
            router.push(`/quiz/${packId}?restart=true`);
        } catch (err) {
            console.error('퀴즈팩 초기화 실패:', err);
        }
    }, [dbUser?.id, packId, router]);

    // 시간 포맷팅 (MM:SS)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const width = secs < 10 ? '0' : '';
        return `${mins}분 ${width}${secs}초`;
    };

    if (isLoading) {
        return (
            <MobileFrame className="flex flex-col items-center justify-center">
                <div style={{ fontSize: '16px', color: '#6b7280' }}>결과 불러오는 중...</div>
            </MobileFrame>
        );
    }

    return (
        <MobileFrame className="flex flex-col bg-gradient-to-b from-amber-50 to-white">
            {/* 상단 축하 메시지 */}
            <div style={{
                padding: '40px 20px',
                textAlign: 'center',
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                }}>
                    🎉
                </div>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '8px',
                }}>
                    퀴즈팩 완료!
                </h1>
                <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                }}>
                    수고하셨습니다!
                </p>
                {/* 소요 시간 표시 */}
                {result && result.totalTimeSeconds > 0 && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full text-sm text-gray-600 border border-gray-200">
                        <Clock size={16} />
                        <span>걸린 시간: {formatTime(result.totalTimeSeconds)}</span>
                    </div>
                )}
            </div>

            {/* 결과 요약 카드 */}
            <div style={{
                margin: '0 20px',
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}>
                <h2 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '20px',
                    textAlign: 'center',
                }}>
                    결과 요약
                </h2>

                {/* 정답률 원형 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '24px',
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: `conic-gradient(#f59e0b ${(result?.correctRate || 0) * 3.6}deg, #e5e7eb 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                        }}>
                            <span style={{
                                fontSize: '28px',
                                fontWeight: 'bold',
                                color: '#f59e0b',
                            }}>
                                {result?.correctRate?.toFixed(0) || 0}%
                            </span>
                            <span style={{
                                fontSize: '12px',
                                color: '#6b7280',
                            }}>
                                정답률
                            </span>
                        </div>
                    </div>
                </div>

                {/* 상세 결과 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '16px',
                    textAlign: 'center',
                }}>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                            {result?.totalQuizCount || 0}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>총 문제</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                            {result?.correctCount || 0}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>정답</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                            {result?.incorrectCount || 0}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>오답</div>
                    </div>
                </div>
            </div>

            {/* 선호도 입력 (별점) */}
            <div style={{
                margin: '24px 20px',
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                textAlign: 'center',
            }}>
                <h3 style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '12px',
                }}>
                    이 퀴즈팩은 어땠나요?
                </h3>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                            }}
                        >
                            <Star
                                size={32}
                                fill={star <= rating ? '#f59e0b' : 'none'}
                                color={star <= rating ? '#f59e0b' : '#d1d5db'}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* 버튼 영역 */}
            <div style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: 'auto',
            }}>
                <button
                    onClick={handleNextQuizpack}
                    disabled={isSaving}
                    style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: isSaving ? '#d1d5db' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isSaving ? '저장 중...' : '다음 퀴즈팩 시작'}
                </button>

                {/* 결과보기 + 다시풀기 버튼 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleViewResults}
                        disabled={isSaving}
                        style={{
                            flex: 1,
                            padding: '14px',
                            backgroundColor: 'transparent',
                            color: '#3b82f6',
                            border: '1px solid #3b82f6',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                        }}
                    >
                        결과보기
                    </button>
                    <button
                        onClick={handleRestart}
                        disabled={isSaving}
                        style={{
                            flex: 1,
                            padding: '14px',
                            backgroundColor: 'transparent',
                            color: '#f59e0b',
                            border: '1px solid #f59e0b',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                        }}
                    >
                        다시풀기
                    </button>
                </div>

                <button
                    onClick={handleGoHome}
                    disabled={isSaving}
                    style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: 'transparent',
                        color: '#6b7280',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isSaving ? '저장 중...' : '홈으로 돌아가기'}
                </button>
            </div>
        </MobileFrame>
    );
}
