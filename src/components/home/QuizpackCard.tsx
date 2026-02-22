'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Lock, LockOpen, SquareCheckBig, Star, SquareArrowRight } from 'lucide-react';
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

    // 클릭 핸들러 (유지)

    // 진행률 계산
    const progressPercent =
        quizpack.status === 'in_progress' && quizpack.solvedQuizCount && quizpack.totalQuizCount
            ? Math.round((quizpack.solvedQuizCount / quizpack.totalQuizCount) * 100)
            : 0;

    // 상태별 스타일 클래스
    const getStatusStyles = () => {
        switch (quizpack.status) {
            case 'closed':
                return 'bg-gray-50 border-gray-200';
            case 'opened':
            case 'in_progress':
            case 'completed':
                return 'hover:shadow-lg hover:-translate-y-1 transition-transform duration-200';
            default:
                return 'bg-white border-gray-200';
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                backgroundColor: quizpack.status === 'closed' ? '#eeeeeeff' :
                    quizpack.status === 'opened' ? '#fba03fff' :
                        quizpack.status === 'in_progress' ? '#ff8400' :
                            quizpack.status === 'completed' ? '#2D2D2D' : '#ffffff',
                border: (quizpack.status === 'completed' || quizpack.status === 'opened' || quizpack.status === 'in_progress')
                    ? 'none'
                    : `1px solid ${quizpack.status === 'closed' ? '#eaecf0ff' : '#e5e7eb'}`,
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '12px',
                cursor: quizpack.status === 'closed' ? 'default' : 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease-out',
            }}
            className={`${getStatusStyles()} active:scale-[0.98]`}
        >
            {/* 상단: 순서 번호 + 상태 아이콘 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
            }}>
                <span style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: (quizpack.status === 'opened' || quizpack.status === 'in_progress') ? '#2D2D2D' :
                        quizpack.status === 'completed' ? '#FF8400' : '#9d9d9dff'
                }}>
                    {String(quizpack.order).padStart(3, '0')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {quizpack.status === 'closed' && (
                        <Lock className="w-5 h-5 text-gray-400" />
                    )}
                    {quizpack.status === 'opened' && (
                        <LockOpen color="#2D2D2D" className="w-5 h-5" />
                    )}
                    {quizpack.status === 'in_progress' && (
                        <SquareArrowRight color="#2D2D2D" className="w-5 h-5" />
                    )}
                    {quizpack.status === 'completed' && (
                        <SquareCheckBig color="#FF8400" className="w-5 h-5" />
                    )}
                </div>
            </div>

            {/* 키워드 태그 */}
            <div className="flex flex-wrap gap-1.5 mb-3 mt-1">
                {quizpack.keywords.split(',').map((k, i) => {
                    const isClosed = quizpack.status === 'closed';
                    const isCompleted = quizpack.status === 'completed';
                    const isOpenedOrInProgress = quizpack.status === 'opened' || quizpack.status === 'in_progress';

                    let tagClass = 'bg-blue-50 text-blue-600 border border-blue-100';
                    let tagStyle = {};

                    if (isClosed) {
                        tagClass = 'bg-gray-200 text-gray-600';
                    } else if (isCompleted) {
                        tagClass = '';
                        tagStyle = { backgroundColor: '#000000ff', color: '#FF8400' };
                    } else if (isOpenedOrInProgress) {
                        tagClass = '';
                        tagStyle = { backgroundColor: '#2D2D2D', color: '#FF8400' };
                    }

                    return (
                        <span key={i} className={`px-2 py-1 rounded-md text-[13px] font-medium ${tagClass}`} style={tagStyle}>
                            #{k.trim()}
                        </span>
                    );
                })}
            </div>

            {/* 퀴즈 개수 */}
            <p style={{
                fontSize: '12px',
                color: (quizpack.status === 'completed' || quizpack.status === 'opened' || quizpack.status === 'in_progress') ? '#ffffff' : '#9ca3af',
                marginBottom: '12px'
            }}>
                퀴즈 {quizpack.quizCount}개
            </p>

            {/* 진행 상태 표시 */}
            {quizpack.status === 'in_progress' && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        fontSize: '12px',
                        color: '#ffffff',
                        fontWeight: '600',
                        marginBottom: '6px'
                    }}>
                        <span>{progressPercent}%</span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${progressPercent}%`,
                            height: '100%',
                            backgroundColor: '#2D2D2D',
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
                <span style={{ color: (quizpack.status === 'completed' || quizpack.status === 'opened' || quizpack.status === 'in_progress') ? '#ffffff' : '#6b7280' }}>
                    {quizpack.status === 'in_progress'
                        ? '진행 중이에요'
                        : quizpack.userCorrectRate !== null
                            ? `정답률 ${Math.round(quizpack.userCorrectRate)}%`
                            : '아직 풀지 않았어요'}
                </span>
                {quizpack.averageRating !== null && (
                    <span style={{
                        color: (quizpack.status === 'opened' || quizpack.status === 'in_progress') ? '#ffffff' : '#f59e0b',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Star className="w-4 h-4 mr-2"
                            color={(quizpack.status === 'opened' || quizpack.status === 'in_progress') ? '#ffffff' : '#FF8400'}
                            fill={(quizpack.status === 'opened' || quizpack.status === 'in_progress') ? '#ffffff' : '#FF8400'}
                        />
                        {quizpack.averageRating.toFixed(1)}
                    </span>
                )}
            </div>
        </div>
    );
}
