'use client';

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
    const { dbUser } = useAuth();

    // 닉네임 기본값 처리
    const nickname = dbUser?.nickname || '사용자';

    const handleConfirm = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md bg-white rounded-2xl border-none shadow-xl"
                showCloseButton={false}
            >
                <DialogHeader className="flex flex-col items-center gap-6 text-center pt-8">
                    {/* 트로피 아이콘 */}
                    <div className="relative">
                        <div className="text-8xl drop-shadow-md filter">🏆</div>
                    </div>

                    <DialogTitle className="text-2xl font-bold text-gray-900 mt-2">
                        축하합니다!
                    </DialogTitle>

                    <div className="text-base text-gray-600 leading-relaxed space-y-2">
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
                        onClick={handleConfirm}
                    >
                        확인
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
