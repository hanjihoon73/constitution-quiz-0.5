import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // 1. 요청 본문에서 userId, authId 추출
        const { userId, authId } = await request.json();

        if (!userId || !authId) {
            return NextResponse.json(
                { error: '필수 파라미터가 누락되었습니다.' },
                { status: 400 }
            );
        }

        // 2. 현재 로그인한 사용자 인증 확인 (서버 클라이언트로)
        const serverSupabase = await createServerClient();
        const { data: { user }, error: authError } = await serverSupabase.auth.getUser();

        if (authError || !user || user.id !== authId) {
            return NextResponse.json(
                { error: '인증되지 않은 요청입니다.' },
                { status: 401 }
            );
        }

        // 3. Admin 클라이언트 생성 (Service Role Key 사용)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // 4. users 테이블에서 사용자 관련 데이터 삭제
        // (user_quizzes, user_quizpacks 등은 FK CASCADE로 자동 삭제되지 않을 수 있으므로 수동 삭제)
        await supabaseAdmin.from('user_quizzes').delete().eq('user_id', userId);
        await supabaseAdmin.from('user_quizpack_ratings').delete().eq('user_id', userId);
        await supabaseAdmin.from('user_quizpacks').delete().eq('user_id', userId);
        await supabaseAdmin.from('user_login_history').delete().eq('user_id', userId);
        await supabaseAdmin.from('users').delete().eq('id', userId);

        // 5. Supabase Auth에서 사용자 삭제
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authId);

        if (deleteError) {
            console.error('Auth 사용자 삭제 에러:', deleteError);
            return NextResponse.json(
                { error: '계정 삭제 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('회원탈퇴 처리 에러:', error);
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
