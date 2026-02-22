import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * 닉네임 중복 검사 (자기 자신 제외)
 */
export async function checkNicknameDuplicate(
    nickname: string,
    currentUserId: number
): Promise<boolean> {
    const { data, error } = await supabase
        .rpc('check_nickname_exists', { check_nickname: nickname });

    if (error) {
        console.error('닉네임 중복 검사 에러:', error);
        return false;
    }

    return data === true;
}

/**
 * 닉네임 업데이트
 */
export async function updateNickname(
    userId: number,
    nickname: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('users')
        .update({ nickname, modified_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) {
        console.error('닉네임 업데이트 에러:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * 회원탈퇴 API 호출
 */
export async function deleteUserAccount(
    userId: number,
    authId: string
): Promise<{ success: boolean; error?: string }> {
    const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, authId }),
    });

    const data = await response.json();

    if (!response.ok) {
        return { success: false, error: data.error || '회원탈퇴 처리 중 오류가 발생했습니다.' };
    }

    return { success: true };
}
