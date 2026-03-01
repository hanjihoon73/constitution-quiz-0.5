'use client';

import { UserAnswer } from '@/hooks/useQuiz';

interface QuizNavigationProps {
    total: number;
    current: number;
    answers: Map<number, UserAnswer>;
    quizIds: number[];
    onNavigate: (index: number) => void;
}

/**
 * 퀴즈 번호 네비게이션 컴포넌트
 */
export function QuizNavigation({ total, current, answers, quizIds, onNavigate }: QuizNavigationProps) {
    const progressPercentage = (current / total) * 100;

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '16px 24px',
                borderBottom: '1px solid #F3F4F6',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '8px 16px',
                    overflowX: 'auto',
                    border: '1px solid #E5E7EB',
                    borderRadius: '9999px',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE and Edge
                }}
                className="hide-scrollbar" // For custom CSS if needed
            >
                {quizIds.map((id, index) => {
                    const quizNum = index + 1;
                    const answer = answers.get(id);
                    const isCurrent = current === quizNum;

                    // 기본 상태: 투명 배경, 연한 회색 테두리, 회색 번호 텍스트
                    let bgColor = 'transparent';
                    let borderColor = '#E5E7EB';
                    let textColor = '#9CA3AF';

                    if (isCurrent && !answer) {
                        // 현재 진행 중 (미해결): 다크 그레이 배경, 오렌지 번호 텍스트
                        bgColor = '#2D2D2D';
                        borderColor = '#2D2D2D';
                        textColor = '#FF8400';
                    } else if (answer) {
                        if (answer.isCorrect) {
                            // 정답: 시안색 배경, #2D2D2D 텍스트
                            bgColor = '#38D2E3';
                            borderColor = '#38D2E3';
                            textColor = '#2D2D2D';
                        } else {
                            // 오답: 핑크색 배경, #2D2D2D 텍스트
                            bgColor = '#FB84C5';
                            borderColor = '#FB84C5';
                            textColor = '#2D2D2D';
                        }
                    }

                    return (
                        <button
                            key={id}
                            onClick={() => onNavigate(index)}
                            style={{
                                minWidth: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: bgColor,
                                border: `1px solid ${borderColor}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: isCurrent || answer ? 'bold' : 'bold',
                                color: textColor,
                                cursor: 'pointer',
                                flexShrink: 0,
                                padding: 0,
                                transition: 'all 0.2s',
                            }}
                        >
                            {quizNum}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
