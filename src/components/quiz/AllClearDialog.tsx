'use client';

import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth';

interface AllClearDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AllClearDialog({ open, onOpenChange }: AllClearDialogProps) {
    const router = useRouter();
    const { dbUser } = useAuth();

    // 닉네임 기본값 처리
    const nickname = dbUser?.nickname || '사용자';

    const handleGoHome = () => {
        router.push('/');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl border-none shadow-xl">
                <DialogHeader className="flex flex-col items-center gap-6 text-center pt-8">
                    {/* 트로피 아이콘 (이미지와 유사한 스타일) */}
                    <div className="relative">
                        <div className="text-8xl drop-shadow-md filter">🏆</div>
                        {/* 반짝임 효과 등을 추가할 수 있음 */}
                    </div>

                    <DialogTitle className="text-2xl font-bold text-gray-900 mt-2">
                        축하합니다!
                    </DialogTitle>

                    <div className="text-base text-gray-600 leading-relaxed space-y-2">
                        <p>
                            모든 퀴즈팩을 완료하셨습니다!
                        </p>
                        <p>
                            대한민국의 헌법을 마스터한 <span className="font-bold text-[#f59e0b]">{nickname}</span>님을<br />
                            <span className="font-bold text-gray-900">대법관으로 임명합니다.</span>
                        </p>
                        <p className="text-sm text-gray-500 pt-2">
                            앞으로도 우리나라의 헌법 수호를 위해<br />
                            최선을 다해주세요.
                        </p>
                    </div>
                </DialogHeader>

                <DialogFooter className="sm:justify-center p-6 pt-2">
                    <Button
                        type="button"
                        className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-3 text-lg rounded-xl shadow-md transition-all active:scale-95"
                        onClick={handleGoHome}
                    >
                        확인
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
