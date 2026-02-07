'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuiz } from '@/hooks/useQuiz';
import {
    QuizLayout,
    QuizNavigation,
    QuizContent,
    QuizActions,
} from '@/components/quiz';
import { Loading } from '@/components/common';

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const packId = Number(params.packId);

    const {
        packData,
        currentQuiz,
        progress,
        answers,
        isChecked,
        showHint,
        showExplanation,
        isLoading,
        error,
        isLastQuiz,
        selectChoice,
        setBlankAnswer,
        checkAnswer,
        goToNext,
        goToQuiz,
        toggleHint,
        saveProgress,
        completeQuizPack,
    } = useQuiz(packId);

    // 정답 확인 핸들러
    const handleCheckAnswer = useCallback(() => {
        checkAnswer();
    }, [checkAnswer]);

    // 퀴즈 완료 핸들러
    const handleComplete = useCallback(async () => {
        await completeQuizPack();
        router.push(`/quiz/${packId}/complete`);
    }, [completeQuizPack, packId, router]);

    // 나가기 핸들러 (진행 상태 저장)
    const handleExit = useCallback(async () => {
        await saveProgress();
    }, [saveProgress]);

    // 로딩 중
    if (isLoading) {
        return (
            <QuizLayout>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Loading />
                </div>
            </QuizLayout>
        );
    }

    // 에러
    if (error || !packData || !currentQuiz) {
        return (
            <QuizLayout>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                }}>
                    <p style={{ color: '#ef4444', marginBottom: '16px' }}>
                        퀴즈를 불러오는데 실패했습니다.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </QuizLayout>
        );
    }

    // 현재 퀴즈의 사용자 답안
    const currentAnswer = answers.get(currentQuiz.id);
    const selectedIds = currentAnswer?.selectedChoiceIds || [];
    const blankAnswers = currentAnswer?.blankAnswers || new Map();

    // 답을 선택했는지 확인
    const hasAnswer = currentQuiz.quizType === 'choiceblank'
        ? blankAnswers.size > 0
        : selectedIds.length > 0;

    return (
        <QuizLayout onExit={handleExit}>
            {/* 네비게이션 */}
            <QuizNavigation
                total={progress.total}
                current={progress.current}
                answers={answers}
                quizIds={packData.quizzes.map(q => q.id)}
                onNavigate={goToQuiz}
            />

            {/* 퀴즈 콘텐츠 */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                <QuizContent
                    quiz={currentQuiz}
                    selectedIds={selectedIds}
                    blankAnswers={blankAnswers}
                    onSelectChoice={selectChoice}
                    onSetBlank={setBlankAnswer}
                    isChecked={isChecked}
                    showHint={showHint}
                    showExplanation={showExplanation}
                    onToggleHint={toggleHint}
                />
            </div>

            {/* 하단 버튼 */}
            <QuizActions
                isChecked={isChecked}
                isLastQuiz={isLastQuiz}
                hasAnswer={hasAnswer}
                onCheckAnswer={handleCheckAnswer}
                onNext={goToNext}
                onComplete={handleComplete}
            />
        </QuizLayout>
    );
}

