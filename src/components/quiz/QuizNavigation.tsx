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
    // 숫자를 동그라미 숫자로 변환
    const circledNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

    return (
        <div
            style={{
                display: 'flex',
                gap: '8px',
                padding: '12px 16px',
                overflowX: 'auto',
                borderBottom: '1px solid #f3f4f6',
            }}
        >
            {Array.from({ length: total }, (_, i) => {
                const quizId = quizIds[i];
                const answer = quizId ? answers.get(quizId) : undefined;
                const isCurrent = i === current - 1;
                const isAnswered = answer !== undefined;
                const isCorrect = answer?.isCorrect;

                // 상태에 따른 스타일
                let backgroundColor = '#f9fafb';
                let color = '#6b7280';
                let borderColor = 'transparent';

                if (isCurrent) {
                    backgroundColor = '#f59e0b';
                    color = 'white';
                } else if (isAnswered) {
                    if (isCorrect === true) {
                        backgroundColor = '#dcfce7';
                        color = '#16a34a';
                    } else if (isCorrect === false) {
                        backgroundColor = '#fef2f2';
                        color = '#dc2626';
                    } else {
                        backgroundColor = '#e5e7eb';
                        color = '#374151';
                    }
                }

                return (
                    <button
                        key={i}
                        onClick={() => onNavigate(i)}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor,
                            color,
                            border: `2px solid ${borderColor}`,
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: isCurrent ? 'bold' : 'normal',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {circledNumbers[i] || i + 1}
                    </button>
                );
            })}
        </div>
    );
}
