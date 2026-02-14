'use client';

import { useRef, useEffect, useMemo } from 'react';
import { QuizpackCard } from './QuizpackCard';
import { QuizpackWithStatus } from '@/lib/api/quizpacks';

interface QuizpackListProps {
    quizpacks: QuizpackWithStatus[];
    isLoading: boolean;
    error: Error | null;
    onCompletedClick?: (quizpackId: number) => void;  // 완료된 퀴즈팩 클릭 콜백
    onOpenedClick?: (quizpackId: number) => void;  // 열림 퀴즈팩 클릭 콜백
}

/**
 * 퀴즈팩 목록 컴포넌트
 */
export function QuizpackList({ quizpacks, isLoading, error, onCompletedClick, onOpenedClick }: QuizpackListProps) {
    const currentRef = useRef<HTMLDivElement>(null);

    // current_quizpack 식별: in_progress 우선 → 첫 번째 opened
    const currentQuizpackId = useMemo(() => {
        const inProgress = quizpacks.find(q => q.status === 'in_progress');
        if (inProgress) return inProgress.id;
        const firstOpened = quizpacks.find(q => q.status === 'opened');
        if (firstOpened) return firstOpened.id;
        return null;
    }, [quizpacks]);

    // 현재 퀴즈팩으로 자동 스크롤
    useEffect(() => {
        if (currentRef.current && currentQuizpackId) {
            // 약간의 딜레이 후 스크롤 (렌더링 완료 대기)
            const timer = setTimeout(() => {
                currentRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentQuizpackId]);

    // 로딩 상태
    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 px-4 py-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-32 rounded-2xl bg-gray-100 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-red-500 text-center mb-2">
                    퀴즈팩을 불러오는데 실패했습니다.
                </p>
                <p className="text-sm text-gray-400 text-center">
                    잠시 후 다시 시도해 주세요.
                </p>
            </div>
        );
    }

    // 빈 상태
    if (quizpacks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-gray-500 text-center">
                    퀴즈팩이 없습니다.
                </p>
            </div>
        );
    }

    // 퀴즈팩 목록
    return (
        <div className="px-4 py-6 overflow-y-auto">
            {quizpacks.map((quizpack) => {
                const isCurrent = quizpack.id === currentQuizpackId;
                return (
                    <div
                        key={quizpack.id}
                        ref={isCurrent ? currentRef : undefined}
                    >
                        <QuizpackCard
                            quizpack={quizpack}
                            onCompletedClick={onCompletedClick}
                            onOpenedClick={onOpenedClick}
                            isCurrent={isCurrent}
                        />
                    </div>
                );
            })}
        </div>
    );
}
