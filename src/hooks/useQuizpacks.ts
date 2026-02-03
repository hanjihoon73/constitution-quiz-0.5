'use client';

import { useState, useEffect, useCallback } from 'react';
import { QuizpackWithStatus, getQuizpacksWithStatus } from '@/lib/api/quizpacks';
import { useAuth } from '@/components/auth';

interface UseQuizpacksReturn {
    quizpacks: QuizpackWithStatus[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * 퀴즈팩 목록을 가져오는 커스텀 훅
 */
export function useQuizpacks(): UseQuizpacksReturn {
    const { dbUser } = useAuth();
    const [quizpacks, setQuizpacks] = useState<QuizpackWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchQuizpacks = useCallback(async () => {
        if (!dbUser?.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await getQuizpacksWithStatus(dbUser.id);
            setQuizpacks(data);
        } catch (err) {
            console.error('퀴즈팩 조회 에러:', err);
            setError(err instanceof Error ? err : new Error('퀴즈팩을 불러오는데 실패했습니다.'));
        } finally {
            setIsLoading(false);
        }
    }, [dbUser?.id]);

    useEffect(() => {
        fetchQuizpacks();
    }, [fetchQuizpacks]);

    return {
        quizpacks,
        isLoading,
        error,
        refetch: fetchQuizpacks,
    };
}
