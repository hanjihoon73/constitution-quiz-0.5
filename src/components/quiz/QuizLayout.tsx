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
                    padding: '16px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <button
                    onClick={handleExitClick}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        fontSize: '14px',
                    }}
                >
                    <span style={{ fontSize: '20px' }}>←</span>
                    <span>나가기</span>
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
