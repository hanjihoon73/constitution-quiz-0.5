'use client';

import { useState } from 'react';
import { QuizChoice } from '@/lib/api/quiz';

interface ChoiceBlankProps {
    passage: string;
    choices: QuizChoice[];
    blankCount: number;
    blankAnswers: Map<number, number>;
    onSetBlank: (position: number, choiceId: number) => void;
    isChecked: boolean;
}

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

    // 빈칸 클릭 시 - 선택된 보기가 있으면 채우고, 없으면 활성화
    const handleBlankClick = (position: number) => {
        if (isChecked) return;

        if (selectedChoice !== null) {
            // 선택된 보기가 있으면 빈칸 채우기
            onSetBlank(position, selectedChoice);
            setSelectedChoice(null);
            setActiveBlank(null);
        } else {
            // 선택된 보기가 없으면 빈칸 활성화
            setActiveBlank(activeBlank === position ? null : position);
        }
    };

    // 보기 클릭 시
    const handleChoiceClick = (choiceId: number) => {
        if (isChecked) return;

        // 활성화된 빈칸이 있으면 바로 채우기
        if (activeBlank !== null) {
            onSetBlank(activeBlank, choiceId);
            setActiveBlank(null);
            setSelectedChoice(null);
        } else {
            // 활성화된 빈칸이 없으면 보기 선택 상태 토글
            setSelectedChoice(choiceId === selectedChoice ? null : choiceId);
        }
    };

    // 빈칸 초기화 (이미 채워진 빈칸 클릭 시)
    const handleClearBlank = (position: number) => {
        if (isChecked) return;
        // 빈칸을 다시 클릭하면 비우기 (0을 보내서 리셋)
        // 실제로는 Map에서 삭제해야 하므로 부모 컴포넌트에서 처리
        setActiveBlank(position);
    };

    // 지문에서 빈칸 패턴을 찾아서 렌더링
    const renderPassageWithBlanks = () => {
        // (  ①  ), (  ②  ) 또는 _____ 패턴을 찾음
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
            let backgroundColor = '#f3f4f6';
            let borderColor = '#9ca3af';
            let textColor = '#9ca3af';

            if (isChecked && filledChoice) {
                const isCorrect = filledChoiceId === correctChoice?.id;
                if (isCorrect) {
                    backgroundColor = '#dcfce7';
                    borderColor = '#16a34a';
                    textColor = '#16a34a';
                } else {
                    backgroundColor = '#fef2f2';
                    borderColor = '#dc2626';
                    textColor = '#dc2626';
                }
            } else if (filledChoice) {
                backgroundColor = '#fef3c7';
                borderColor = '#f59e0b';
                textColor = '#92400e';
            } else if (isActive) {
                backgroundColor = '#dbeafe';
                borderColor = '#3b82f6';
                textColor = '#1d4ed8';
            }

            const circledNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

            return (
                <button
                    key={`blank-${i}`}
                    onClick={() => filledChoice && !isChecked
                        ? handleClearBlank(position)
                        : handleBlankClick(position)}
                    disabled={isChecked}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '80px',
                        padding: '4px 12px',
                        margin: '0 4px',
                        backgroundColor,
                        border: `2px ${isActive ? 'solid' : 'dashed'} ${borderColor}`,
                        borderRadius: '8px',
                        cursor: isChecked ? 'default' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: textColor,
                        transition: 'all 0.2s ease',
                    }}
                >
                    {filledChoice ? filledChoice.choiceText : circledNumbers[position - 1] || `(${position})`}
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
                        backgroundColor: activeBlank ? '#dbeafe' : selectedChoice ? '#fef3c7' : '#f3f4f6',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: activeBlank ? '#1d4ed8' : selectedChoice ? '#92400e' : '#6b7280',
                        textAlign: 'center',
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
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '12px',
                    fontWeight: 'bold',
                }}>
                    보기
                </p>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    {choices.map((choice) => {
                        const isUsed = usedChoiceIds.includes(choice.id);
                        const isSelectedNow = selectedChoice === choice.id;

                        return (
                            <button
                                key={choice.id}
                                onClick={() => handleChoiceClick(choice.id)}
                                disabled={isChecked || isUsed}
                                style={{
                                    padding: '10px 18px',
                                    backgroundColor: isSelectedNow
                                        ? '#f59e0b'
                                        : isUsed
                                            ? '#e5e7eb'
                                            : '#ffffff',
                                    color: isSelectedNow
                                        ? '#ffffff'
                                        : isUsed
                                            ? '#9ca3af'
                                            : '#374151',
                                    border: `2px solid ${isSelectedNow ? '#f59e0b' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    cursor: isChecked || isUsed ? 'default' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    textDecoration: isUsed ? 'line-through' : 'none',
                                    transition: 'all 0.2s ease',
                                    opacity: isUsed ? 0.6 : 1,
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
