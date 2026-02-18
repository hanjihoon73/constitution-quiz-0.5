'use client';

import Image from 'next/image';
import Link from 'next/link';
import { User } from 'lucide-react';

interface HeaderProps {
    showProfile?: boolean;
}

/**
 * 공통 헤더 컴포넌트
 * - BI 로고 (클릭 시 홈으로 이동)
 * - 프로필 아이콘 (클릭 시 마이페이지로 이동)
 */
export function Header({ showProfile = true }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full safe-area-top">
            <div className="glass flex h-14 items-center justify-between px-4">
                {/* BI 로고 */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/bi-constitution-quiz-horizontal.svg"
                        alt="모두의 헌법"
                        width={120}
                        height={28}
                        priority
                    />
                </Link>

                {/* 우측 영역 */}
                <div className="flex items-center gap-2">
                    {/* 프로필 아이콘 */}
                    {showProfile && (
                        <Link
                            href="/profile"
                            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                        >
                            <User className="h-6 w-6 text-gray-700" />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
