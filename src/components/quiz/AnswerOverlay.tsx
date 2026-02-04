'use client';

import { useEffect, useState } from 'react';

interface AnswerOverlayProps {
    isCorrect: boolean;
    isVisible: boolean;
    onComplete: () => void;
}

/**
 * 정오답 오버레이 컴포넌트
 * - 정답: 초록색 배경 + ✅
 * - 오답: 빨간색 배경 + ❌
 * - 2초 후 자동으로 사라짐
 */
export function AnswerOverlay({ isCorrect, isVisible, onComplete }: AnswerOverlayProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                onComplete();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    if (!show) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isCorrect
                    ? 'rgba(34, 197, 94, 0.9)'
                    : 'rgba(239, 68, 68, 0.9)',
                zIndex: 100,
                animation: 'fadeIn 0.3s ease-out',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    color: 'white',
                }}
            >
                <span style={{ fontSize: '80px' }}>
                    {isCorrect ? '✅' : '❌'}
                </span>
                <span style={{ fontSize: '28px', fontWeight: 'bold' }}>
                    {isCorrect ? '정답입니다!' : '오답입니다'}
                </span>
            </div>
        </div>
    );
}
