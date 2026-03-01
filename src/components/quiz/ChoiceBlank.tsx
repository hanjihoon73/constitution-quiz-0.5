'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { QuizChoice } from '@/lib/api/quiz';

interface ChoiceBlankProps {
    passage: string;
    choices: QuizChoice[];
    blankCount: number;
    blankAnswers: Map<number, number>;
    onSetBlank: (position: number, choiceId: number) => void;
    isChecked: boolean;
}

// 색상 상수
const COLOR = {
    correct: { bg: '#EFF6FF', border: '#3B82F6', text: '#2563EB' },
    wrong: { bg: '#FEF2F2', border: '#EF4444', text: '#DC2626' },
    selected: { bg: '#3B82F6', border: '#3B82F6', text: '#ffffff' }, // 빈칸이 채워졌을 때
    active: { bg: '#EFF6FF', border: '#3B82F6', text: '#2563EB' }, // 빈칸을 클릭해서 활성화했을 때
    default: { bg: '#ffffff', border: '#3B82F6', text: '#3B82F6' }, // 기본 빈칸
};

/**
 * 빈칸 채우기 퀴즈 컴포넌트
 */
export function ChoiceBlank({
    passage,
    choices,
    blankCount,
    blankAnswers,
    onSetBlank,
    isChecked
}: ChoiceBlankProps) {
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [activeBlank, setActiveBlank] = useState<number | null>(null);

    // 빈칸 클릭 시
    const handleBlankClick = (position: number) => {
        if (isChecked) return;
        if (selectedChoice !== null) {
            onSetBlank(position, selectedChoice);
            setSelectedChoice(null);
            setActiveBlank(null);
        } else {
            setActiveBlank(activeBlank === position ? null : position);
        }
    };

    // 보기 클릭 시
    const handleChoiceClick = (choiceId: number) => {
        if (isChecked) return;
        if (activeBlank !== null) {
            onSetBlank(activeBlank, choiceId);
            setActiveBlank(null);
            setSelectedChoice(null);
        } else {
            setSelectedChoice(choiceId === selectedChoice ? null : choiceId);
        }
    };

    // 빈칸 초기화
    const handleClearBlank = (position: number) => {
        if (isChecked) return;
        setActiveBlank(position);
    };

    // 지문에서 빈칸 패턴을 찾아서 렌더링
    const renderPassageWithBlanks = () => {
        const blankPattern = /\(\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*\)|_____/g;
        const parts: (string | { type: 'blank'; position: number })[] = [];
        let lastIndex = 0;
        let blankIndex = 0;
        let match;

        while ((match = blankPattern.exec(passage)) !== null) {
            if (match.index > lastIndex) {
                parts.push(passage.substring(lastIndex, match.index));
            }
            blankIndex++;
            parts.push({ type: 'blank', position: blankIndex });
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < passage.length) {
            parts.push(passage.substring(lastIndex));
        }

        return parts.map((part, i) => {
            if (typeof part === 'string') {
                return <span key={`text-${i}`}>{part}</span>;
            }

            const position = part.position;
            const filledChoiceId = blankAnswers.get(position);
            const filledChoice = choices.find(c => c.id === filledChoiceId);
            const correctChoice = choices.find(c => c.blankPosition === position && c.isCorrect);
            const isActive = activeBlank === position;

            // 스타일 결정
            let colors = COLOR.default;
            let resultIcon: 'correct' | 'wrong' | null = null;

            if (isChecked && filledChoice) {
                const isCorrectAnswer = filledChoiceId === correctChoice?.id;
                colors = isCorrectAnswer ? COLOR.correct : COLOR.wrong;
                resultIcon = isCorrectAnswer ? 'correct' : 'wrong';
            } else if (filledChoice) {
                colors = COLOR.selected;
            } else if (isActive) {
                colors = COLOR.active;
            }

            const circledNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

            return (
                <button
                    key={`blank-${i}`}
                    onClick={() => filledChoice && !isChecked
                        ? handleClearBlank(position)
                        : handleBlankClick(position)}
                    disabled={isChecked}
                    className="quiz-hover"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        minWidth: '80px',
                        padding: '6px 14px',
                        margin: '0 4px',
                        backgroundColor: colors.bg,
                        border: `2px ${isActive || filledChoice ? 'solid' : 'dashed'} ${colors.border}`,
                        borderRadius: '12px',
                        cursor: isChecked ? 'default' : 'pointer',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        color: colors.text,
                        transition: 'all 0.2s ease',
                    }}
                >
                    {filledChoice ? filledChoice.choiceText : circledNumbers[position - 1] || `(${position})`}
                    {resultIcon === 'correct' && <Check size={16} color="#3B82F6" strokeWidth={3} />}
                    {resultIcon === 'wrong' && <X size={16} color="#EF4444" strokeWidth={3} />}
                </button>
            );
        });
    };

    // 사용된 보기 ID들
    const usedChoiceIds = Array.from(blankAnswers.values());

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 안내 메시지 */}
            {!isChecked && (
                <div
                    style={{
                        padding: '12px 16px',
                        backgroundColor: activeBlank ? '#EFF6FF' : selectedChoice ? '#EFF6FF' : '#F3F4F6',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: activeBlank ? '#2563EB' : selectedChoice ? '#2563EB' : '#6B7280',
                        textAlign: 'center',
                        fontWeight: '500',
                    }}
                >
                    {activeBlank
                        ? `${activeBlank}번 빈칸이 선택되었습니다. 아래에서 보기를 선택하세요.`
                        : selectedChoice
                            ? '위에서 빈칸을 클릭하여 답을 채우세요.'
                            : '빈칸 또는 보기를 클릭하세요.'}
                </div>
            )}

            {/* 지문 (빈칸 포함) */}
            <div
                style={{
                    backgroundColor: '#f9fafb',
                    padding: '20px',
                    borderRadius: '12px',
                    lineHeight: '2.2',
                    fontSize: '15px',
                }}
            >
                {renderPassageWithBlanks()}
            </div>

            {/* 보기 목록 */}
            <div>
                <p style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    marginBottom: '12px',
                    fontWeight: 'bold',
                }}>
                    보기
                </p>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    {choices.map((choice) => {
                        const isUsed = usedChoiceIds.includes(choice.id);
                        const isSelectedNow = selectedChoice === choice.id;

                        return (
                            <button
                                key={choice.id}
                                onClick={() => handleChoiceClick(choice.id)}
                                disabled={isChecked || isUsed}
                                className={isChecked || isUsed ? '' : 'quiz-hover'}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: isSelectedNow
                                        ? '#EFF6FF'
                                        : isUsed
                                            ? '#ffffff'
                                            : '#F3F4F6',
                                    color: isSelectedNow
                                        ? '#2563EB'
                                        : isUsed
                                            ? '#9CA3AF'
                                            : '#374151',
                                    border: `2px solid ${isSelectedNow ? '#3B82F6' : isUsed ? '#E5E7EB' : 'transparent'}`,
                                    borderRadius: '9999px', // 캡슐 모양
                                    cursor: isChecked || isUsed ? 'default' : 'pointer',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    textDecoration: isUsed ? 'line-through' : 'none',
                                    opacity: isUsed ? 0.6 : 1,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {choice.choiceText}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
