'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { MobileFrame } from '@/components/common';
import { ExitConfirmDialog } from './ExitConfirmDialog';
import { useState } from 'react';

interface QuizLayoutProps {
    children: ReactNode;
    onExit?: () => void;
}

/**
 * 퀴즈 화면 전체 레이아웃
 */
export function QuizLayout({ children, onExit }: QuizLayoutProps) {
    const router = useRouter();
    const [showExitDialog, setShowExitDialog] = useState(false);

    const handleExitClick = () => {
        setShowExitDialog(true);
    };

    const handleConfirmExit = async () => {
        if (onExit) {
            await onExit();
        }
        router.push('/');
    };

    return (
        <MobileFrame className="flex flex-col bg-white">
            {/* 헤더 */}
            <header
                style={{
                    padding: '16px 20px 10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <button
                    onClick={handleExitClick}
                    className="quiz-hover"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B7280',
                        fontSize: '20px',
                    }}
                    aria-label="나가기"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
            </header>

            {/* 메인 콘텐츠 */}
            <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                {children}
            </main>

            {/* 종료 확인 다이얼로그 */}
            <ExitConfirmDialog
                isOpen={showExitDialog}
                onClose={() => setShowExitDialog(false)}
                onConfirm={handleConfirmExit}
            />
        </MobileFrame>
    );
}
