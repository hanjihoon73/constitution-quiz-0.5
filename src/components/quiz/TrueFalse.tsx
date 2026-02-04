'use client';

import { QuizChoice } from '@/lib/api/quiz';

interface TrueFalseProps {
    choices: QuizChoice[];
    selectedIds: number[];
    onSelect: (choiceId: number) => void;
    isChecked: boolean;
}

/**
 * OX (참/거짓) 퀴즈 컴포넌트
 */
export function TrueFalse({ choices, selectedIds, onSelect, isChecked }: TrueFalseProps) {
    // 보기 정렬 (맞아요가 먼저)
    const sortedChoices = [...choices].sort((a, b) => a.choiceOrder - b.choiceOrder);

    return (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {sortedChoices.map((choice) => {
                const isSelected = selectedIds.includes(choice.id);
                const isTrue = choice.choiceText.includes('맞') || choice.choiceText === 'O';

                // 상태에 따른 스타일
                let backgroundColor = '#ffffff';
                let borderColor = '#e5e7eb';
                let textColor = '#374151';

                if (isChecked) {
                    if (choice.isCorrect) {
                        backgroundColor = '#dcfce7';
                        borderColor = '#16a34a';
                        textColor = '#16a34a';
                    } else if (isSelected && !choice.isCorrect) {
                        backgroundColor = '#fef2f2';
                        borderColor = '#dc2626';
                        textColor = '#dc2626';
                    }
                } else if (isSelected) {
                    backgroundColor = isTrue ? '#dcfce7' : '#fef2f2';
                    borderColor = isTrue ? '#16a34a' : '#dc2626';
                    textColor = isTrue ? '#16a34a' : '#dc2626';
                }

                return (
                    <button
                        key={choice.id}
                        onClick={() => !isChecked && onSelect(choice.id)}
                        disabled={isChecked}
                        style={{
                            width: '120px',
                            height: '120px',
                            backgroundColor,
                            border: `3px solid ${borderColor}`,
                            borderRadius: '16px',
                            cursor: isChecked ? 'default' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <span style={{
                            fontSize: '40px',
                            filter: isSelected || isChecked ? 'none' : 'grayscale(100%)',
                        }}>
                            {isTrue ? '⭕' : '❌'}
                        </span>
                        <span style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: textColor,
                        }}>
                            {choice.choiceText}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
