'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth';
import { MobileFrame } from '@/components/common';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WithdrawDialog } from '@/components/profile';
import { updateNickname, checkNicknameDuplicate } from '@/lib/api/user';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, Check, X, LogOut } from 'lucide-react';

// 닉네임 유효성 검사 정규식 (2-10자, 한글/영문/숫자만)
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;

export default function ProfilePage() {
    const router = useRouter();
    const { user, dbUser, isLoading, signOut, refreshDbUser } = useAuth();

    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [newNickname, setNewNickname] = useState('');
    const [nicknameError, setNicknameError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

    // 로그인 안 되어 있으면 로그인 페이지로
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [isLoading, user, router]);

    // 닉네임 유효성 검사
    const validateNickname = (value: string) => {
        if (!value) return '닉네임을 입력해주세요.';
        if (value.length < 2) return '닉네임은 2자 이상이어야 합니다.';
        if (value.length > 10) return '닉네임은 10자 이하여야 합니다.';
        if (!NICKNAME_REGEX.test(value)) return '한글, 영문, 숫자만 사용할 수 있습니다.';
        return '';
    };

    // 닉네임 편집 시작
    const startEditNickname = () => {
        setNewNickname(dbUser?.nickname || '');
        setNicknameError('');
        setIsEditingNickname(true);
    };

    // 닉네임 편집 취소
    const cancelEditNickname = () => {
        setIsEditingNickname(false);
        setNewNickname('');
        setNicknameError('');
    };

    // 닉네임 저장
    const saveNickname = async () => {
        if (!dbUser) return;

        // 변경 없으면 종료
        if (newNickname === dbUser.nickname) {
            cancelEditNickname();
            return;
        }

        // 유효성 검사
        const error = validateNickname(newNickname);
        if (error) {
            setNicknameError(error);
            return;
        }

        setIsSaving(true);

        // 중복 검사
        const isDuplicate = await checkNicknameDuplicate(newNickname, dbUser.id);
        if (isDuplicate) {
            setNicknameError('이미 사용 중인 닉네임입니다.');
            setIsSaving(false);
            return;
        }

        // 업데이트
        const result = await updateNickname(dbUser.id, newNickname);
        if (result.success) {
            toast.success('닉네임이 변경되었습니다.');
            await refreshDbUser();
            setIsEditingNickname(false);
        } else {
            toast.error(result.error || '닉네임 변경에 실패했습니다.');
        }

        setIsSaving(false);
    };

    // 로그아웃
    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    // 계정 종류 표시
    const getProviderLabel = (provider: string) => {
        switch (provider) {
            case 'google': return 'Google';
            case 'kakao': return 'Kakao';
            default: return provider;
        }
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'google': return '🔵';
            case 'kakao': return '🟡';
            default: return '⚪';
        }
    };

    if (isLoading || !dbUser) {
        return (
            <MobileFrame>
                <Header />
                <div className="flex flex-1 items-center justify-center">
                    <div className="text-gray-400">로딩 중...</div>
                </div>
            </MobileFrame>
        );
    }

    return (
        <MobileFrame>
            <Header />
            <main className="flex-1 overflow-y-auto">
                {/* 뒤로가기 */}
                <div className="px-4 pt-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm">돌아가기</span>
                    </button>
                </div>

                {/* 프로필 카드 */}
                <div className="px-4 pt-6 pb-4">
                    <div className="glass-card p-6">
                        {/* 프로필 아이콘 + 닉네임 */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF8400] to-[#FFB347] flex items-center justify-center shadow-lg">
                                <span className="text-4xl">👤</span>
                            </div>

                            {/* 닉네임 영역 */}
                            {isEditingNickname ? (
                                <div className="w-full max-w-[280px] space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            value={newNickname}
                                            onChange={(e) => {
                                                setNewNickname(e.target.value);
                                                setNicknameError(validateNickname(e.target.value));
                                            }}
                                            maxLength={10}
                                            className={`h-10 text-center text-lg font-bold ${nicknameError ? 'border-red-500' : ''}`}
                                            autoFocus
                                        />
                                        <button
                                            onClick={saveNickname}
                                            disabled={isSaving || !!nicknameError}
                                            className="p-2 rounded-full hover:bg-green-50 text-green-600 disabled:opacity-50 transition-colors"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={cancelEditNickname}
                                            className="p-2 rounded-full hover:bg-red-50 text-red-400 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    {nicknameError && (
                                        <p className="text-center text-xs text-red-500">{nicknameError}</p>
                                    )}
                                    <p className="text-center text-xs text-gray-400">
                                        한글, 영문, 숫자 2-10자
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {dbUser.nickname}
                                    </h2>
                                    <button
                                        onClick={startEditNickname}
                                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 계정 정보 */}
                <div className="px-4 pb-4">
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">
                            계정 정보
                        </h3>

                        <div className="space-y-4">
                            {/* 계정 종류 */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">계정 종류</span>
                                <div className="flex items-center gap-2">
                                    <span>{getProviderIcon(dbUser.provider)}</span>
                                    <span className="text-sm font-medium text-gray-800">
                                        {getProviderLabel(dbUser.provider)}
                                    </span>
                                </div>
                            </div>

                            {/* 구분선 */}
                            <div className="border-t border-gray-100" />

                            {/* ID */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">ID</span>
                                <span className="text-sm font-mono text-gray-600">
                                    {dbUser.id}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 로그아웃 버튼 */}
                <div className="px-4 pb-4">
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full h-12 rounded-xl text-gray-600 border-gray-200 hover:bg-gray-50 font-medium text-base gap-2"
                    >
                        <LogOut size={18} />
                        로그아웃
                    </Button>
                </div>

                {/* 회원탈퇴 */}
                <div className="px-4 pb-4 flex justify-center">
                    <button
                        onClick={() => setShowWithdrawDialog(true)}
                        className="text-sm text-gray-400 underline underline-offset-4 hover:text-gray-500 transition-colors"
                    >
                        회원탈퇴
                    </button>
                </div>

                {/* 서비스 문의 */}
                <div className="px-4 pb-8 flex justify-center">
                    <p className="text-xs text-gray-300">
                        서비스 문의: cognityhelp@gmail.com
                    </p>
                </div>
            </main>

            {/* 회원탈퇴 안내 팝업 */}
            <WithdrawDialog
                open={showWithdrawDialog}
                onOpenChange={setShowWithdrawDialog}
                nickname={dbUser.nickname}
                userId={dbUser.id}
                authId={user?.id || ''}
            />
        </MobileFrame>
    );
}
