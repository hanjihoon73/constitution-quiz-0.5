'use client';

import { useState, useEffect, useCallback } from 'react';
import { Quiz, QuizPackData, getQuizzesByPackId, saveQuizProgress, getUserQuizProgress, saveUserQuizAnswer, getUserQuizpackId } from '@/lib/api/quiz';
import { useAuth } from '@/components/auth';

// 사용자의 답안 타입
export interface UserAnswer {
    quizId: number;
    selectedChoiceIds: number[];  // 선택한 보기 ID들
    blankAnswers?: Map<number, number>;  // 빈칸채우기: position -> choiceId
    isCorrect?: boolean;
}

interface UseQuizState {
    packData: QuizPackData | null;
    currentIndex: number;
    answers: Map<number, UserAnswer>;
    isChecked: boolean;
    showHint: boolean;
    showExplanation: boolean;
    isLoading: boolean;
    error: Error | null;
    startTime: Date | null;
    userQuizpackId: number | null;
}

interface UseQuizReturn extends UseQuizState {
    currentQuiz: Quiz | null;
    progress: { current: number; total: number };
    selectChoice: (choiceId: number) => void;
    setBlankAnswer: (position: number, choiceId: number) => void;
    checkAnswer: () => boolean;
    goToNext: () => void;
    goToPrev: () => void;
    goToQuiz: (index: number) => void;
    toggleHint: () => void;
    toggleExplanation: () => void;
    saveProgress: () => Promise<void>;
    completeQuizPack: () => Promise<void>;
    isLastQuiz: boolean;
    isFirstQuiz: boolean;
    correctCount: number;
    incorrectCount: number;
}

export function useQuiz(packId: number): UseQuizReturn {
    const { dbUser } = useAuth();
    const [state, setState] = useState<UseQuizState>({
        packData: null,
        currentIndex: 0,
        answers: new Map(),
        isChecked: false,
        showHint: false,
        showExplanation: false,
        isLoading: true,
        error: null,
        startTime: null,
        userQuizpackId: null,
    });

    // 퀴즈 데이터 로드
    useEffect(() => {
        async function loadQuizzes() {
            try {
                setState(prev => ({ ...prev, isLoading: true, error: null }));

                const data = await getQuizzesByPackId(packId);

                // 기존 진행 상태 확인 (이어하기)
                let startIndex = 0;
                if (dbUser?.id) {
                    const progress = await getUserQuizProgress(dbUser.id, packId);
                    if (progress && progress.status === 'in_progress') {
                        // 중단한 위치부터 시작
                        startIndex = Math.min(
                            (progress.current_quiz_order || 1) - 1,
                            data.quizzes.length - 1
                        );
                    }
                }

                // user_quizpack_id 조회
                let userQuizpackId: number | null = null;
                if (dbUser?.id) {
                    userQuizpackId = await getUserQuizpackId(dbUser.id, packId);
                }

                setState(prev => ({
                    ...prev,
                    packData: data,
                    currentIndex: startIndex,
                    isLoading: false,
                    startTime: new Date(),
                    userQuizpackId,
                }));
            } catch (err) {
                console.error('퀴즈 로드 에러:', err);
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: err instanceof Error ? err : new Error('퀴즈를 불러오는데 실패했습니다.'),
                }));
            }
        }

        loadQuizzes();
    }, [packId, dbUser?.id]);

    const currentQuiz = state.packData?.quizzes[state.currentIndex] || null;
    const totalQuizzes = state.packData?.quizzes.length || 0;
    const isLastQuiz = state.currentIndex === totalQuizzes - 1;
    const isFirstQuiz = state.currentIndex === 0;

    // 정답/오답 개수 계산
    const { correctCount, incorrectCount } = (() => {
        let correct = 0;
        let incorrect = 0;
        state.answers.forEach(answer => {
            if (answer.isCorrect === true) correct++;
            else if (answer.isCorrect === false) incorrect++;
        });
        return { correctCount: correct, incorrectCount: incorrect };
    })();

    // 보기 선택
    const selectChoice = useCallback((choiceId: number) => {
        if (state.isChecked || !currentQuiz) return;

        setState(prev => {
            const newAnswers = new Map(prev.answers);
            const existing = newAnswers.get(currentQuiz.id);

            // 이미 선택된 경우 토글
            if (existing?.selectedChoiceIds.includes(choiceId)) {
                newAnswers.set(currentQuiz.id, {
                    ...existing,
                    selectedChoiceIds: existing.selectedChoiceIds.filter(id => id !== choiceId),
                });
            } else {
                // 새로 선택 (단일 선택으로 대체)
                newAnswers.set(currentQuiz.id, {
                    quizId: currentQuiz.id,
                    selectedChoiceIds: [choiceId],
                    blankAnswers: existing?.blankAnswers,
                });
            }

            return { ...prev, answers: newAnswers };
        });
    }, [state.isChecked, currentQuiz]);

    // 빈칸 답안 설정 (빈칸채우기용)
    const setBlankAnswer = useCallback((position: number, choiceId: number) => {
        if (state.isChecked || !currentQuiz) return;

        setState(prev => {
            const newAnswers = new Map(prev.answers);
            const existing = newAnswers.get(currentQuiz.id);
            const blankAnswers = new Map(existing?.blankAnswers || []);

            blankAnswers.set(position, choiceId);

            newAnswers.set(currentQuiz.id, {
                quizId: currentQuiz.id,
                selectedChoiceIds: existing?.selectedChoiceIds || [],
                blankAnswers,
            });

            return { ...prev, answers: newAnswers };
        });
    }, [state.isChecked, currentQuiz]);

    // 정답 확인
    const checkAnswer = useCallback((): boolean => {
        if (!currentQuiz) return false;

        const userAnswer = state.answers.get(currentQuiz.id);
        if (!userAnswer) return false;

        let isCorrect = false;

        if (currentQuiz.quizType === 'choiceblank') {
            // 빈칸채우기: 모든 빈칸이 올바른 보기로 채워졌는지 확인
            const blankAnswers = userAnswer.blankAnswers;
            if (blankAnswers && blankAnswers.size > 0) {
                isCorrect = currentQuiz.choices
                    .filter(c => c.isCorrect && c.blankPosition !== null)
                    .every(c => blankAnswers.get(c.blankPosition!) === c.id);
            }
        } else {
            // multiple, truefalse: 선택한 보기가 정답인지 확인
            const correctChoiceIds = currentQuiz.choices
                .filter(c => c.isCorrect)
                .map(c => c.id);

            isCorrect =
                userAnswer.selectedChoiceIds.length === correctChoiceIds.length &&
                userAnswer.selectedChoiceIds.every(id => correctChoiceIds.includes(id));
        }

        // 정답 여부 저장
        setState(prev => {
            const newAnswers = new Map(prev.answers);
            const existing = newAnswers.get(currentQuiz.id);
            if (existing) {
                newAnswers.set(currentQuiz.id, { ...existing, isCorrect });
            }
            return { ...prev, answers: newAnswers, isChecked: true, showExplanation: true };
        });

        // user_quizzes 테이블에 저장 (비동기, 에러 무시)
        if (dbUser?.id && state.userQuizpackId) {
            const selectedAnswers = currentQuiz.quizType === 'choiceblank'
                ? Object.fromEntries(userAnswer.blankAnswers || [])
                : userAnswer.selectedChoiceIds;

            saveUserQuizAnswer(
                dbUser.id,
                currentQuiz.id,
                state.userQuizpackId,
                state.currentIndex + 1,
                selectedAnswers,
                isCorrect
            ).catch(err => console.error('퀴즈 답변 저장 에러:', err));
        }

        return isCorrect;
    }, [currentQuiz, state.answers, dbUser?.id, state.userQuizpackId, state.currentIndex]);

    // 다음 퀴즈로 이동
    const goToNext = useCallback(() => {
        if (isLastQuiz) return;
        setState(prev => ({
            ...prev,
            currentIndex: prev.currentIndex + 1,
            isChecked: false,
            showHint: false,
            showExplanation: false,
        }));
    }, [isLastQuiz]);

    // 이전 퀴즈로 이동
    const goToPrev = useCallback(() => {
        if (isFirstQuiz) return;
        setState(prev => ({
            ...prev,
            currentIndex: prev.currentIndex - 1,
            isChecked: false,
            showHint: false,
            showExplanation: false,
        }));
    }, [isFirstQuiz]);

    // 특정 퀴즈로 이동
    const goToQuiz = useCallback((index: number) => {
        if (index < 0 || index >= totalQuizzes) return;
        setState(prev => ({
            ...prev,
            currentIndex: index,
            isChecked: false,
            showHint: false,
            showExplanation: false,
        }));
    }, [totalQuizzes]);

    // 힌트 토글
    const toggleHint = useCallback(() => {
        setState(prev => ({ ...prev, showHint: !prev.showHint }));
    }, []);

    // 해설 토글
    const toggleExplanation = useCallback(() => {
        setState(prev => ({ ...prev, showExplanation: !prev.showExplanation }));
    }, []);

    // 진행 상태 저장
    const saveProgress = useCallback(async () => {
        if (!dbUser?.id || !state.packData) return;

        await saveQuizProgress(dbUser.id, packId, {
            currentQuizOrder: state.currentIndex + 1,
            solvedQuizCount: state.answers.size,
            correctCount,
            incorrectCount,
            totalQuizCount: totalQuizzes,
            status: 'in_progress',
        });
    }, [dbUser?.id, packId, state.packData, state.currentIndex, state.answers.size, correctCount, incorrectCount, totalQuizzes]);

    // 퀴즈팩 완료
    const completeQuizPack = useCallback(async () => {
        if (!dbUser?.id || !state.packData || !state.startTime) return;

        const totalTimeSeconds = Math.floor((new Date().getTime() - state.startTime.getTime()) / 1000);

        await saveQuizProgress(dbUser.id, packId, {
            currentQuizOrder: totalQuizzes,
            solvedQuizCount: totalQuizzes,
            correctCount,
            incorrectCount,
            totalQuizCount: totalQuizzes,
            status: 'completed',
            totalTimeSeconds,
        });
    }, [dbUser?.id, packId, state.packData, state.startTime, totalQuizzes, correctCount, incorrectCount]);

    return {
        ...state,
        currentQuiz,
        progress: { current: state.currentIndex + 1, total: totalQuizzes },
        selectChoice,
        setBlankAnswer,
        checkAnswer,
        goToNext,
        goToPrev,
        goToQuiz,
        toggleHint,
        toggleExplanation,
        saveProgress,
        completeQuizPack,
        isLastQuiz,
        isFirstQuiz,
        correctCount,
        incorrectCount,
    };
}
