'use client';

import { QuizpackCard } from './QuizpackCard';
import { QuizpackWithStatus } from '@/lib/api/quizpacks';

interface QuizpackListProps {
    quizpacks: QuizpackWithStatus[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * 퀴즈팩 목록 컴포넌트
 */
export function QuizpackList({ quizpacks, isLoading, error }: QuizpackListProps) {
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
            {quizpacks.map((quizpack) => (
                <QuizpackCard key={quizpack.id} quizpack={quizpack} />
            ))}
        </div>
    );
}
