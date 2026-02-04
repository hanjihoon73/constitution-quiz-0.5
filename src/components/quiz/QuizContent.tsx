'use client';

import { Quiz, QuizChoice } from '@/lib/api/quiz';
import { MultipleChoice } from './MultipleChoice';
import { TrueFalse } from './TrueFalse';
import { ChoiceBlank } from './ChoiceBlank';

interface QuizContentProps {
    quiz: Quiz;
    selectedIds: number[];
    blankAnswers: Map<number, number>;
    onSelectChoice: (choiceId: number) => void;
    onSetBlank: (position: number, choiceId: number) => void;
    isChecked: boolean;
    showHint: boolean;
    showExplanation: boolean;
    onToggleHint: () => void;
}

/**
 * 퀴즈 콘텐츠 영역 (질문, 지문, 보기, 힌트, 해설)
 */
export function QuizContent({
    quiz,
    selectedIds,
    blankAnswers,
    onSelectChoice,
    onSetBlank,
    isChecked,
    showHint,
    showExplanation,
    onToggleHint,
}: QuizContentProps) {
    // 퀴즈 유형별 컴포넌트 렌더링
    const renderQuizType = () => {
        switch (quiz.quizType) {
            case 'multiple':
                return (
                    <MultipleChoice
                        choices={quiz.choices}
                        selectedIds={selectedIds}
                        onSelect={onSelectChoice}
                        isChecked={isChecked}
                    />
                );
            case 'truefalse':
                return (
                    <TrueFalse
                        choices={quiz.choices}
                        selectedIds={selectedIds}
                        onSelect={onSelectChoice}
                        isChecked={isChecked}
                    />
                );
            case 'choiceblank':
                return (
                    <ChoiceBlank
                        passage={quiz.passage}
                        choices={quiz.choices}
                        blankCount={quiz.blankCount || 1}
                        blankAnswers={blankAnswers}
                        onSetBlank={onSetBlank}
                        isChecked={isChecked}
                    />
                );
            default:
                return <p>지원하지 않는 퀴즈 유형입니다.</p>;
        }
    };

    // 퀴즈 유형 라벨
    const getQuizTypeLabel = () => {
        switch (quiz.quizType) {
            case 'multiple':
                return '선다';
            case 'truefalse':
                return 'O/X';
            case 'choiceblank':
                return '빈칸채우기';
            default:
                return '';
        }
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 퀴즈 유형 라벨 */}
            <div>
                <span
                    style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        backgroundColor: quiz.quizType === 'truefalse' ? '#dbeafe' :
                            quiz.quizType === 'choiceblank' ? '#fef3c7' : '#f3e8ff',
                        color: quiz.quizType === 'truefalse' ? '#1d4ed8' :
                            quiz.quizType === 'choiceblank' ? '#92400e' : '#7c3aed',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                    }}
                >
                    {getQuizTypeLabel()}
                </span>
            </div>

            {/* 질문 */}
            <div>
                <h2 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    lineHeight: '1.6',
                }}>
                    {quiz.question}
                </h2>
            </div>

            {/* 지문 (빈칸채우기가 아닌 경우에만) */}
            {quiz.quizType !== 'choiceblank' && quiz.passage && (
                <div
                    style={{
                        backgroundColor: '#f9fafb',
                        padding: '16px',
                        borderRadius: '12px',
                        borderLeft: '4px solid #f59e0b',
                    }}
                >
                    <p style={{
                        fontSize: '15px',
                        color: '#4b5563',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-wrap',
                    }}>
                        {quiz.passage}
                    </p>
                </div>
            )}

            {/* 보기 영역 */}
            <div style={{ marginTop: '8px' }}>
                {renderQuizType()}
            </div>

            {/* 힌트 버튼 & 내용 */}
            {quiz.hint && (
                <div>
                    <button
                        onClick={onToggleHint}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            backgroundColor: showHint ? '#fef3c7' : '#f3f4f6',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#6b7280',
                        }}
                    >
                        <span>💡</span>
                        <span>{showHint ? '힌트 숨기기' : '힌트 보기'}</span>
                    </button>
                    {showHint && (
                        <div
                            style={{
                                marginTop: '12px',
                                padding: '12px 16px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#92400e',
                            }}
                        >
                            {quiz.hint}
                        </div>
                    )}
                </div>
            )}

            {/* 해설 (정답 확인 후) */}
            {isChecked && showExplanation && quiz.explanation && (
                <div
                    style={{
                        padding: '16px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '12px',
                        borderLeft: '4px solid #3b82f6',
                    }}
                >
                    <p style={{
                        fontSize: '12px',
                        color: '#3b82f6',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                    }}>
                        📖 해설
                    </p>
                    <p style={{
                        fontSize: '14px',
                        color: '#1e40af',
                        lineHeight: '1.6',
                    }}>
                        {quiz.explanation}
                    </p>
                </div>
            )}
        </div>
    );
}
