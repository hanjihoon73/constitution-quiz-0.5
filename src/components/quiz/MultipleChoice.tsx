'use client';

import { QuizChoice } from '@/lib/api/quiz';

interface MultipleChoiceProps {
    choices: QuizChoice[];
    selectedIds: number[];
    onSelect: (choiceId: number) => void;
    isChecked: boolean;
}

/**
 * 4지선다 퀴즈 컴포넌트
 */
export function MultipleChoice({ choices, selectedIds, onSelect, isChecked }: MultipleChoiceProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {choices.map((choice, index) => {
                const isSelected = selectedIds.includes(choice.id);

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
                    backgroundColor = '#fef3c7';
                    borderColor = '#f59e0b';
                    textColor = '#92400e';
                }

                return (
                    <button
                        key={choice.id}
                        onClick={() => !isChecked && onSelect(choice.id)}
                        disabled={isChecked}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            backgroundColor,
                            border: `2px solid ${borderColor}`,
                            borderRadius: '12px',
                            cursor: isChecked ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left',
                        }}
                    >
                        {/* 번호 */}
                        <span
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: isSelected ? borderColor : '#f3f4f6',
                                color: isSelected ? '#ffffff' : '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                flexShrink: 0,
                            }}
                        >
                            {index + 1}
                        </span>

                        {/* 보기 텍스트 */}
                        <span style={{ color: textColor, flex: 1 }}>
                            {choice.choiceText}
                        </span>

                        {/* 정답 확인 후 아이콘 표시 */}
                        {isChecked && choice.isCorrect && (
                            <span style={{ fontSize: '20px' }}>✅</span>
                        )}
                        {isChecked && isSelected && !choice.isCorrect && (
                            <span style={{ fontSize: '20px' }}>❌</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
