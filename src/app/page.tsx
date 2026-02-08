'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MobileFrame, Header } from '@/components/common';
import { QuizpackList } from '@/components/home';
import { useAuth } from '@/components/auth';
import { useQuizpacks } from '@/hooks/useQuizpacks';
import { AllClearDialog } from '@/components/quiz/AllClearDialog';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, dbUser, isLoading: authLoading } = useAuth();
  const { quizpacks, isLoading: quizpacksLoading, error } = useQuizpacks();

  const [showAllClearDialog, setShowAllClearDialog] = useState(false);

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

  const handleAllClearDialogChange = (open: boolean) => {
    setShowAllClearDialog(open);
    if (!open) {
      // 팝업 닫을 때 URL 파라미터 제거
      router.replace('/', { scroll: false });
    }
  };

  return (
    <MobileFrame className="flex flex-col">
      <Header />

      {/* 퀴즈팩 목록 (스크롤 가능) */}
      <main className="flex-1 overflow-y-auto">
        <QuizpackList
          quizpacks={quizpacks}
          isLoading={authLoading || quizpacksLoading}
          error={error}
        />
      </main>

      <AllClearDialog
        open={showAllClearDialog}
        onOpenChange={handleAllClearDialogChange}
      />
    </MobileFrame>
  );
}
