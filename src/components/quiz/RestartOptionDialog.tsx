'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RestartOptionDialogProps {
    open: boolean;
    onClose: () => void;
    onViewResults: () => void;
    onRestart: () => void;
}

export function RestartOptionDialog({ open, onClose, onViewResults, onRestart }: RestartOptionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl border-none shadow-xl p-6">
                <DialogHeader className="flex flex-col items-center gap-4 text-center">
                    <div className="text-6xl">📋</div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        이미 완료한 퀴즈팩입니다
                    </DialogTitle>
                    <p className="text-gray-600 text-sm">
                        마지막 결과를 확인하거나<br />
                        처음부터 다시 풀 수 있습니다.
                    </p>
                </DialogHeader>

                {/* 버튼을 DialogContent 내부에 직접 배치 */}
                <div className="flex flex-col gap-3 mt-4">
                    <Button
                        type="button"
                        className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-3 text-lg rounded-xl shadow-md transition-all active:scale-95"
                        onClick={onViewResults}
                    >
                        결과 보기
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 text-lg rounded-xl transition-all active:scale-95"
                        onClick={onRestart}
                    >
                        다시 풀기
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
