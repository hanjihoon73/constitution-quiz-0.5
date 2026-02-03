'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobileFrame, Header } from '@/components/common';
import { QuizpackList } from '@/components/home';
import { useAuth } from '@/components/auth';
import { useQuizpacks } from '@/hooks/useQuizpacks';

export default function Home() {
  const router = useRouter();
  const { user, dbUser, isLoading: authLoading } = useAuth();
  const { quizpacks, isLoading: quizpacksLoading, error } = useQuizpacks();

  // 신규 사용자는 온보딩으로 자동 리다이렉트
  useEffect(() => {
    if (!authLoading && user && !dbUser) {
      router.push('/onboarding');
    }
  }, [authLoading, user, dbUser, router]);

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
    </MobileFrame>
  );
}
