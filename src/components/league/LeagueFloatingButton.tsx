'use client';

import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';

/**
 * 리그 플로팅 버튼
 * - MobileFrame(relative 컨테이너) 내부 우하단에 고정
 * - fixed 대신 absolute 사용 → PC에서도 콘텐츠 영역 안에 위치
 */
export function LeagueFloatingButton() {
    const router = useRouter();

    return (
        <>
            <style>{`
                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float-gentle {
                    animation: float-gentle 3s ease-in-out infinite;
                }
            `}</style>
            <button
                onClick={() => router.push('/league')}
                className="animate-float-gentle absolute bottom-12 right-8 z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                    backgroundColor: '#2D2D2D',
                    border: '5px solid #FF8400',
                    boxShadow: '0px 4px 10px #8a8a8aff',
                }}
                aria-label="주간 리그 랭킹 보기"
            >
                <Trophy className="w-9 h-9" style={{ color: '#FF8400' }} strokeWidth={1.5} />
            </button>
        </>
    );
}

