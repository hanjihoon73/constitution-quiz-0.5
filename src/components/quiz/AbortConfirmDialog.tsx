'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AbortConfirmDialogProps {
    open: boolean;
    currentPackOrder: number;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * 진행 중인 퀴즈팩이 있을 때 다른 퀴즈팩을 시작하려는 경우 경고 다이얼로그
 */
export function AbortConfirmDialog({
    open,
    currentPackOrder,
    onConfirm,
    onCancel,
}: AbortConfirmDialogProps) {
    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl border-none shadow-xl p-6">
                <DialogHeader className="flex flex-col items-center gap-4 text-center">
                    <div className="text-6xl">⚠️</div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        진행 중인 퀴즈팩이 있습니다
                    </DialogTitle>
                    <p className="text-gray-600 text-sm">
                        {currentPackOrder}번 퀴즈팩을 진행 중입니다.<br />
                        새로운 퀴즈팩을 시작하면<br />
                        기존 진행 기록이 초기화됩니다.
                    </p>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-4">
                    <Button
                        type="button"
                        className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-3 text-lg rounded-xl shadow-md transition-all active:scale-95"
                        onClick={onConfirm}
                    >
                        계속하기
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 text-lg rounded-xl transition-all active:scale-95"
                        onClick={onCancel}
                    >
                        취소
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
