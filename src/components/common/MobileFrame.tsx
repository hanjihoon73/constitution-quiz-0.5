'use client';

import { ReactNode } from 'react';

interface MobileFrameProps {
    children: ReactNode;
    className?: string;
}

/**
 * 모바일 프레임 컨테이너
 * - 최대 480px 너비
 * - PC에서 중앙 정렬 + 그림자
 * - 모바일에서 전체 너비
 */
export function MobileFrame({ children, className = '' }: MobileFrameProps) {
    return (
        <div className="min-h-[100dvh] bg-gray-100">
            <div
                className={`
          mobile-frame
          mx-auto 
          max-w-[480px] 
          min-h-[100dvh] 
          bg-white 
          relative
          flex
          flex-col
          ${className}
        `}
            >
                {children}
            </div>
        </div>
    );
}
