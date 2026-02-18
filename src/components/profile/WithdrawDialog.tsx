'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteUserAccount } from '@/lib/api/user';
import { useAuth } from '@/components/auth';
import { toast } from 'sonner';

interface WithdrawDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    nickname: string;
    userId: number;
    authId: string;
}

export function WithdrawDialog({
    open,
    onOpenChange,
    nickname,
    userId,
    authId,
}: WithdrawDialogProps) {
    const router = useRouter();
    const { signOut } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleWithdraw = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteUserAccount(userId, authId);

            if (!result.success) {
                toast.error(result.error || '회원탈퇴 처리 중 오류가 발생했습니다.');
                setIsDeleting(false);
                return;
            }

            // 클라이언트 세션 정리
            await signOut();
            toast.success('회원탈퇴가 완료되었습니다.');
            router.push('/login');
        } catch (error) {
            console.error('회원탈퇴 에러:', error);
            toast.error('회원탈퇴 처리 중 오류가 발생했습니다.');
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md bg-white rounded-2xl border-none shadow-xl"
                showCloseButton={false}
            >
                <DialogHeader className="text-center space-y-3 pt-6">
                    {/* 슬픈 표정 아이콘 */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-5xl">😢</span>
                        </div>
                    </div>
                    <DialogTitle className="text-xl font-bold text-gray-800">
                        정말 떠나시나요?
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600 leading-relaxed px-2">
                        <span className="font-semibold text-gray-800">{nickname}</span>님이 지금 탈퇴하시면
                        <br />
                        대한민국의 헌법 수호력이 크게 약해집니다.
                        <br />
                        <br />
                        부디 헌법을 지키기 위해
                        <br />
                        힘을 보태주세요!
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col gap-3 p-6 pt-4 sm:flex-col">
                    <Button
                        type="button"
                        className="w-full bg-[#FF8400] hover:bg-[#e67700] text-white font-bold py-3 text-lg rounded-xl shadow-md transition-all active:scale-95"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        알겠어
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-gray-600 font-medium py-3 text-base"
                        onClick={handleWithdraw}
                        disabled={isDeleting}
                    >
                        {isDeleting ? '처리 중...' : '탈퇴할래'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
