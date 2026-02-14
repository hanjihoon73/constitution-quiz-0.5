'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { QuizpackWithStatus } from '@/lib/api/quizpacks';

interface QuizpackCardProps {
    quizpack: QuizpackWithStatus;
    onCompletedClick?: (quizpackId: number) => void;  // 완료된 퀴즈팩 클릭 콜백
    onOpenedClick?: (quizpackId: number) => void;  // 열림 퀴즈팩 클릭 콜백
    isCurrent?: boolean;  // 현재 풀어야 할 퀴즈팩 여부
}

/**
 * 퀴즈팩 카드 컴포넌트
 * - 상태별 스타일 적용
 * - 클릭 시 상태에 따른 동작
 */
export function QuizpackCard({ quizpack, onCompletedClick, onOpenedClick, isCurrent }: QuizpackCardProps) {
    const router = useRouter();

    // 클릭 핸들러
    const handleClick = () => {
        switch (quizpack.status) {
            case 'closed':
                toast.info('순서대로 진행해 주세요.');
                break;
            case 'opened':
                if (onOpenedClick) {
                    onOpenedClick(quizpack.id);
                } else {
                    router.push(`/quiz/${quizpack.id}`);
                }
                break;
            case 'in_progress':
                router.push(`/quiz/${quizpack.id}?resume=true`);
                break;
            case 'completed':
                // 완료된 퀴즈팩은 콜백이 있으면 호출, 없으면 바로 진입
                if (onCompletedClick) {
                    onCompletedClick(quizpack.id);
                } else {
                    router.push(`/quiz/${quizpack.id}`);
                }
                break;
        }
    };

    // 키워드를 해시태그로 변환
    const formatKeywords = (keywords: string) => {
        return keywords
            .split(',')
            .map((k) => `#${k.trim()}`)
            .join(' ');
    };

    // 진행률 계산
    const progressPercent =
        quizpack.status === 'in_progress' && quizpack.solvedQuizCount && quizpack.totalQuizCount
            ? Math.round((quizpack.solvedQuizCount / quizpack.totalQuizCount) * 100)
            : 0;

    // 상태별 스타일 클래스
    const getStatusStyles = () => {
        switch (quizpack.status) {
            case 'closed':
                return 'bg-gray-50 border-gray-200 opacity-60';
            case 'opened':
                return 'bg-white border-gray-200 hover:border-primary/30 hover:shadow-lg';
            case 'in_progress':
                return 'bg-amber-50 border-amber-300 hover:shadow-lg';
            case 'completed':
                return 'bg-green-50 border-green-300 hover:shadow-lg';
            default:
                return 'bg-white border-gray-200';
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                backgroundColor: quizpack.status === 'closed' ? '#f9fafb' :
                    quizpack.status === 'in_progress' ? '#fffbeb' :
                        quizpack.status === 'completed' ? '#f0fdf4' : '#ffffff',
                border: isCurrent
                    ? '2px solid #f59e0b'
                    : `1px solid ${quizpack.status === 'closed' ? '#e5e7eb' :
                        quizpack.status === 'in_progress' ? '#fcd34d' :
                            quizpack.status === 'completed' ? '#86efac' : '#e5e7eb'
                    }`,
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '12px',
                cursor: quizpack.status === 'closed' ? 'not-allowed' : 'pointer',
                opacity: quizpack.status === 'closed' ? 0.6 : 1,
                boxShadow: isCurrent
                    ? '0 0 0 3px rgba(245, 158, 11, 0.2), 0 4px 12px rgba(245, 158, 11, 0.15)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease-out',
            }}
            className={`${getStatusStyles()} active:scale-[0.98] ${isCurrent ? 'animate-pulse-subtle' : ''}`}
        >
            {/* 상단: 순서 번호 + 상태 아이콘 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
            }}>
                <span style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: quizpack.status === 'opened' ? '#f59e0b' : '#6b7280'
                }}>
                    {String(quizpack.order).padStart(3, '0')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {quizpack.status === 'closed' && (
                        <span style={{ fontSize: '16px' }}>🔒</span>
                    )}
                    {quizpack.status === 'in_progress' && (
                        <span style={{ fontSize: '16px' }}>📝</span>
                    )}
                    {quizpack.status === 'completed' && (
                        <span style={{ fontSize: '16px' }}>✅</span>
                    )}
                </div>
            </div>

            {/* 키워드 태그 */}
            <p style={{
                fontSize: '14px',
                color: quizpack.status === 'opened' ? '#3b82f6' : '#6b7280',
                marginBottom: '8px',
                fontWeight: '500'
            }}>
                {formatKeywords(quizpack.keywords)}
            </p>

            {/* 퀴즈 개수 */}
            <p style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginBottom: '12px'
            }}>
                퀴즈 {quizpack.quizCount}개
            </p>

            {/* 진행 상태 표시 */}
            {quizpack.status === 'in_progress' && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: '#d97706',
                        marginBottom: '4px'
                    }}>
                        <span>진행중</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '3px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${progressPercent}%`,
                            height: '100%',
                            backgroundColor: '#f59e0b',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>
            )}

            {/* 하단: 정답률 & 별점 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px'
            }}>
                <span style={{ color: '#6b7280' }}>
                    {quizpack.userCorrectRate !== null
                        ? `정답률 ${Math.round(quizpack.userCorrectRate)}%`
                        : '아직 풀지 않았어요'}
                </span>
                {quizpack.averageRating !== null && (
                    <span style={{ color: '#f59e0b' }}>
                        ⭐ {quizpack.averageRating.toFixed(1)}
                    </span>
                )}
            </div>
        </div>
    );
}
