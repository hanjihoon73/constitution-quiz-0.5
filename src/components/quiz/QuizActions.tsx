'use client';

interface QuizActionsProps {
    isChecked: boolean;
    isLastQuiz: boolean;
    hasAnswer: boolean;
    onCheckAnswer: () => void;
    onNext: () => void;
    onComplete: () => void;
}

/**
 * 퀴즈 하단 버튼 영역
 */
export function QuizActions({
    isChecked,
    isLastQuiz,
    hasAnswer,
    onCheckAnswer,
    onNext,
    onComplete,
}: QuizActionsProps) {
    return (
        <div
            style={{
                padding: '16px 20px',
                borderTop: '1px solid #f3f4f6',
                backgroundColor: '#ffffff',
            }}
        >
            {!isChecked ? (
                // 정답 확인 전
                <button
                    onClick={onCheckAnswer}
                    disabled={!hasAnswer}
                    style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: hasAnswer ? '#f59e0b' : '#e5e7eb',
                        color: hasAnswer ? '#ffffff' : '#9ca3af',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: hasAnswer ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                    }}
                >
                    정답 확인
                </button>
            ) : (
                // 정답 확인 후
                <button
                    onClick={isLastQuiz ? onComplete : onNext}
                    style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: isLastQuiz ? '#22c55e' : '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {isLastQuiz ? '퀴즈 완료' : '다음 문제'}
                </button>
            )}
        </div>
    );
}
