'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MobileFrame, Header } from '@/components/common';
import { QuizpackList } from '@/components/home';
import { useAuth } from '@/components/auth';
import { useQuizpacks } from '@/hooks/useQuizpacks';
import { AllClearDialog } from '@/components/quiz/AllClearDialog';
import { RestartOptionDialog } from '@/components/quiz/RestartOptionDialog';
import { AbortConfirmDialog } from '@/components/quiz/AbortConfirmDialog';
import { toast } from 'sonner';
import {
  resetUserQuizpack,
  getUserQuizpackId,
  getInProgressQuizpack,
  abortInProgressQuizpack,
} from '@/lib/api/quiz';

export default function Home() {
  return (
    <Suspense fallback={
      <MobileFrame>
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-400">로딩 중...</div>
        </div>
      </MobileFrame>
    }>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, dbUser, isLoading: authLoading } = useAuth();
  const { quizpacks, isLoading: quizpacksLoading, error } = useQuizpacks();

  const [showAllClearDialog, setShowAllClearDialog] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showAbortDialog, setShowAbortDialog] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
  const [inProgressPack, setInProgressPack] = useState<{
    id: number;
    quizpack_id: number;
    quizpack_order: number;
  } | null>(null);
  // 중단 후 실행할 액션을 저장
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // 신규 사용자는 온보딩으로 자동 리다이렉트
  useEffect(() => {
    if (!authLoading && user && !dbUser) {
      router.push('/onboarding');
    }
  }, [authLoading, user, dbUser, router]);

  // All Clear 파라미터 확인
  useEffect(() => {
    if (searchParams.get('allClear') === 'true') {
      setShowAllClearDialog(true);
    }
  }, [searchParams]);

  // 환영 파라미터 확인 (온보딩 직후)
  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      toast.success('환영합니다! 🎉', { duration: 2000 });
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router]);

  const handleAllClearDialogChange = (open: boolean) => {
    setShowAllClearDialog(open);
    if (!open) {
      router.replace('/', { scroll: false });
    }
  };

  /**
   * 진행 중인 퀴즈팩 체크 후 액션 실행
   * - in_progress 퀴즈팩이 있으면 경고 다이얼로그 표시 후 대기
   * - 없으면 바로 액션 실행
   */
  const checkInProgressAndExecute = useCallback(async (
    targetPackId: number,
    action: () => void
  ) => {
    if (!dbUser?.id) return;

    try {
      const existing = await getInProgressQuizpack(dbUser.id, targetPackId);
      if (existing) {
        // 진행 중인 퀴즈팩이 있으면 경고 표시
        setInProgressPack(existing);
        setPendingAction(() => action);
        setShowAbortDialog(true);
      } else {
        // 없으면 바로 실행
        action();
      }
    } catch (err) {
      console.error('진행 중 퀴즈팩 체크 실패:', err);
      action(); // 에러 시에도 진행
    }
  }, [dbUser?.id]);

  // 열림(opened) 퀴즈팩 클릭 핸들러
  const handleOpenedClick = useCallback((quizpackId: number) => {
    checkInProgressAndExecute(quizpackId, () => {
      router.push(`/quiz/${quizpackId}`);
    });
  }, [checkInProgressAndExecute, router]);

  // 완료된 퀴즈팩 클릭 핸들러
  const handleCompletedClick = useCallback((quizpackId: number) => {
    setSelectedPackId(quizpackId);
    setShowRestartDialog(true);
  }, []);

  // 결과 보기 핸들러
  const handleViewResults = useCallback(() => {
    setShowRestartDialog(false);
    if (selectedPackId) {
      router.push(`/quiz/${selectedPackId}?mode=view`);
    }
  }, [selectedPackId, router]);

  // 다시 풀기 핸들러
  const handleRestart = useCallback(async () => {
    if (!selectedPackId || !dbUser?.id) return;

    const executeRestart = async () => {
      try {
        const userQuizpackId = await getUserQuizpackId(dbUser.id, selectedPackId);
        if (userQuizpackId) {
          await resetUserQuizpack(userQuizpackId);
        }
        setShowRestartDialog(false);
        router.push(`/quiz/${selectedPackId}?restart=true`);
      } catch (err) {
        console.error('퀴즈팩 초기화 실패:', err);
      }
    };

    // 다시풀기도 in_progress 체크 필요 (다른 퀴즈팩이 진행 중일 수 있음)
    setShowRestartDialog(false);
    checkInProgressAndExecute(selectedPackId, executeRestart);
  }, [selectedPackId, dbUser?.id, router, checkInProgressAndExecute]);

  // AbortConfirmDialog 확인 핸들러 (기존 진행 중 퀴즈팩 중단 + 새 퀴즈팩 시작)
  const handleAbortConfirm = useCallback(async () => {
    if (!inProgressPack) return;

    try {
      await abortInProgressQuizpack(inProgressPack.id);
      setShowAbortDialog(false);
      setInProgressPack(null);

      // 대기 중이던 액션 실행
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } catch (err) {
      console.error('진행 중 퀴즈팩 중단 실패:', err);
    }
  }, [inProgressPack, pendingAction]);

  // AbortConfirmDialog 취소 핸들러
  const handleAbortCancel = useCallback(() => {
    setShowAbortDialog(false);
    setInProgressPack(null);
    setPendingAction(null);
  }, []);

  return (
    <MobileFrame className="flex flex-col">
      <Header />

      {/* 퀴즈팩 목록 (스크롤 가능) */}
      <main className="flex-1 overflow-y-auto">
        <QuizpackList
          quizpacks={quizpacks}
          isLoading={authLoading || quizpacksLoading}
          error={error}
          onCompletedClick={handleCompletedClick}
          onOpenedClick={handleOpenedClick}
        />
      </main>

      <AllClearDialog
        open={showAllClearDialog}
        onOpenChange={handleAllClearDialogChange}
      />

      {/* 완료된 퀴즈팩 재시작 옵션 팝업 (홈에서 표시) */}
      <RestartOptionDialog
        open={showRestartDialog}
        onClose={() => setShowRestartDialog(false)}
        onViewResults={handleViewResults}
        onRestart={handleRestart}
      />

      {/* 진행 중 퀴즈팩 경고 다이얼로그 */}
      <AbortConfirmDialog
        open={showAbortDialog}
        currentPackOrder={inProgressPack?.quizpack_order || 0}
        onConfirm={handleAbortConfirm}
        onCancel={handleAbortCancel}
      />
    </MobileFrame>
  );
}
