'use client';

import { Circle, X } from 'lucide-react';
import { QuizChoice } from '@/lib/api/quiz';

interface TrueFalseProps {
    choices: QuizChoice[]
    selectedIds: number[];
    onSelect: (choiceId: number) => void;
    isChecked: boolean;
}

// 색상 상수
const COLOR = {
    correct: { bg: '#3B82F6', border: '#3B82F6', icon: '#ffffff', text: '#ffffff' },
    wrong: { bg: '#EF4444', border: '#EF4444', icon: '#ffffff', text: '#ffffff' },
    selected: { bg: '#3B82F6', border: '#3B82F6', icon: '#ffffff', text: '#ffffff' },
    default: { bg: '#F3F4F6', border: '#E5E7EB', icon: '#9CA3AF', text: '#6B7280' },
};

/**
 * OX (참/거짓) 퀴즈 컴포넌트
 */
export function TrueFalse({ choices, selectedIds, onSelect, isChecked }: TrueFalseProps) {
    const sortedChoices = [...choices].sort((a, b) => a.choiceOrder - b.choiceOrder);

    return (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between' }}>
            {sortedChoices.map((choice) => {
                const isSelected = selectedIds.includes(choice.id);
                const isTrue = choice.choiceText.includes('맞') || choice.choiceText === 'O';

                // 상태에 따른 색상 결정
                let colors = COLOR.default;

                if (isChecked) {
                    if (choice.isCorrect) {
                        colors = COLOR.correct;
                    } else if (isSelected && !choice.isCorrect) {
                        colors = COLOR.wrong;
                    }
                } else if (isSelected) {
                    colors = COLOR.selected;
                }

                return (
                    <button
                        key={choice.id}
                        onClick={() => !isChecked && onSelect(choice.id)}
                        disabled={isChecked}
                        className={isChecked ? '' : 'quiz-hover'}
                        style={{
                            flex: 1, // 가로 2분할
                            height: '140px',
                            backgroundColor: colors.bg,
                            border: `2px solid ${colors.border}`,
                            borderRadius: '16px',
                            cursor: isChecked ? 'default' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {/* O / X 아이콘 */}
                        {isTrue ? (
                            <Circle
                                size={56}
                                color={colors.icon}
                                strokeWidth={3}
                            />
                        ) : (
                            <X
                                size={56}
                                color={colors.icon}
                                strokeWidth={3}
                            />
                        )}

                        <span style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: colors.text,
                        }}>
                            {choice.choiceText}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
