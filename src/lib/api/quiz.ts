import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type QuizType = Database['public']['Enums']['quiz_type'];

export interface QuizChoice {
    id: number;
    choiceText: string;
    choiceOrder: number;
    isCorrect: boolean;
    blankPosition: number | null;
}

export interface Quiz {
    id: number;
    quizOrder: number;
    quizType: QuizType;
    question: string;
    passage: string;
    hint: string;
    explanation: string;
    blankCount: number | null;
    choices: QuizChoice[];
}

export interface QuizPackData {
    packId: number;
    keywords: string;
    quizzes: Quiz[];
}

/**
 * 퀴즈팩의 퀴즈 목록을 조회합니다.
 */
export async function getQuizzesByPackId(packId: number): Promise<QuizPackData> {
    const supabase = createClient();

    // 퀴즈팩 정보 조회
    const { data: packData, error: packError } = await supabase
        .from('quizpacks')
        .select('id, keywords')
        .eq('id', packId)
        .single();

    if (packError) {
        console.error('퀴즈팩 조회 에러:', packError);
        throw packError;
    }

    // 퀴즈 목록 조회
    const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select(`
            id,
            quiz_order,
            quiz_type,
            question,
            passage,
            hint,
            explanation,
            blank_count,
            quiz_choices (
                id,
                choice_text,
                choice_order,
                is_correct,
                blank_position
            )
        `)
        .eq('quizpack_id', packId)
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('quiz_order', { ascending: true });

    if (quizzesError) {
        console.error('퀴즈 목록 조회 에러:', quizzesError);
        throw quizzesError;
    }

    // 데이터 변환
    const quizzes: Quiz[] = (quizzesData || []).map((q) => ({
        id: q.id,
        quizOrder: q.quiz_order,
        quizType: q.quiz_type,
        question: q.question,
        passage: q.passage,
        hint: q.hint,
        explanation: q.explanation,
        blankCount: q.blank_count,
        choices: (q.quiz_choices || []).map((c) => ({
            id: c.id,
            choiceText: c.choice_text,
            choiceOrder: c.choice_order,
            isCorrect: c.is_correct || false,
            blankPosition: c.blank_position,
        })).sort((a, b) => a.choiceOrder - b.choiceOrder),
    }));

    return {
        packId: packData.id,
        keywords: packData.keywords,
        quizzes,
    };
}

/**
 * 사용자의 퀴즈팩 진행 상태를 저장/업데이트합니다.
 */
export async function saveQuizProgress(
    userId: number,
    packId: number,
    data: {
        currentQuizOrder: number;
        solvedQuizCount: number;
        correctCount: number;
        incorrectCount: number;
        totalQuizCount: number;
        status: 'in_progress' | 'completed';
        totalTimeSeconds?: number;
    }
) {
    const supabase = createClient();

    // 기존 진행 기록 확인
    const { data: existing, error: checkError } = await supabase
        .from('user_quizpacks')
        .select('id, session_number')
        .eq('user_id', userId)
        .eq('quizpack_id', packId)
        .maybeSingle();

    if (checkError) {
        console.error('진행 상태 확인 에러:', checkError);
        throw checkError;
    }

    const correctRate = data.solvedQuizCount > 0
        ? (data.correctCount / data.solvedQuizCount) * 100
        : 0;

    if (existing) {
        // 업데이트
        const updateData: Record<string, unknown> = {
            current_quiz_order: data.currentQuizOrder,
            solved_quiz_count: data.solvedQuizCount,
            correct_count: data.correctCount,
            incorrect_count: data.incorrectCount,
            correct_rate: correctRate,
            status: data.status,
            last_played_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
        };

        if (data.status === 'completed') {
            updateData.completed_at = new Date().toISOString();
            updateData.session_number = (existing.session_number || 0) + 1;
        }

        if (data.totalTimeSeconds) {
            updateData.total_time_seconds = data.totalTimeSeconds;
        }

        const { error: updateError } = await supabase
            .from('user_quizpacks')
            .update(updateData)
            .eq('id', existing.id);

        if (updateError) {
            console.error('진행 상태 업데이트 에러:', updateError);
            throw updateError;
        }
    } else {
        // 신규 생성
        // quizpack_order 조회
        const { data: loadmap } = await supabase
            .from('quizpack_loadmap')
            .select('order')
            .eq('quizpack_id', packId)
            .single();

        const { error: insertError } = await supabase
            .from('user_quizpacks')
            .insert({
                user_id: userId,
                quizpack_id: packId,
                quizpack_order: loadmap?.order || 1,
                current_quiz_order: data.currentQuizOrder,
                solved_quiz_count: data.solvedQuizCount,
                correct_count: data.correctCount,
                incorrect_count: data.incorrectCount,
                correct_rate: correctRate,
                total_quiz_count: data.totalQuizCount,
                status: data.status,
                started_at: new Date().toISOString(),
                last_played_at: new Date().toISOString(),
                session_number: 1,
            });

        if (insertError) {
            console.error('진행 상태 생성 에러:', insertError);
            throw insertError;
        }
    }
}

/**
 * 사용자의 퀴즈팩 진행 상태를 조회합니다.
 */
export async function getUserQuizProgress(userId: number, packId: number) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('user_quizpacks')
        .select('*')
        .eq('user_id', userId)
        .eq('quizpack_id', packId)
        .maybeSingle();

    if (error) {
        console.error('진행 상태 조회 에러:', error);
        throw error;
    }

    return data;
}

/**
 * 사용자의 개별 퀴즈 답변을 저장합니다.
 */
export async function saveUserQuizAnswer(
    userId: number,
    quizId: number,
    userQuizpackId: number,
    quizOrder: number,
    selectedAnswers: number[] | Record<number, number>,
    isCorrect: boolean
) {
    const supabase = createClient();

    // 기존 답변이 있는지 확인 (같은 세션에서 같은 퀴즈)
    const { data: existing } = await supabase
        .from('user_quizzes')
        .select('id')
        .eq('user_quizpack_id', userQuizpackId)
        .eq('quiz_id', quizId)
        .maybeSingle();

    if (existing) {
        // 기존 답변 업데이트
        const { error: updateError } = await supabase
            .from('user_quizzes')
            .update({
                selected_answers: selectedAnswers,
                is_correct: isCorrect,
                answered_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

        if (updateError) {
            console.error('퀴즈 답변 업데이트 에러:', updateError);
            throw updateError;
        }
    } else {
        // 새 답변 저장
        const { error: insertError } = await supabase
            .from('user_quizzes')
            .insert({
                user_id: userId,
                quiz_id: quizId,
                user_quizpack_id: userQuizpackId,
                quiz_order: quizOrder,
                selected_answers: selectedAnswers,
                is_correct: isCorrect,
                answered_at: new Date().toISOString(),
            });

        if (insertError) {
            console.error('퀴즈 답변 저장 에러:', insertError);
            throw insertError;
        }
    }
}

/**
 * user_quizpacks의 ID를 조회합니다.
 */
export async function getUserQuizpackId(userId: number, packId: number): Promise<number | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('user_quizpacks')
        .select('id')
        .eq('user_id', userId)
        .eq('quizpack_id', packId)
        .maybeSingle();

    if (error) {
        console.error('user_quizpack_id 조회 에러:', error);
        return null;
    }

    return data?.id || null;
}

/**
 * 사용자의 이전 퀴즈 답변을 조회합니다.
 */
export interface PreviousAnswer {
    quizId: number;
    selectedAnswers: number[] | Record<string, number>;
    isCorrect: boolean;
}

export async function getUserPreviousAnswers(userQuizpackId: number): Promise<PreviousAnswer[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('user_quizzes')
        .select('quiz_id, selected_answers, is_correct')
        .eq('user_quizpack_id', userQuizpackId);

    if (error) {
        console.error('이전 답변 조회 에러:', error);
        return [];
    }

    return (data || []).map(item => ({
        quizId: item.quiz_id,
        selectedAnswers: item.selected_answers,
        isCorrect: item.is_correct,
    }));
}

/**
 * 퀴즈팩 통계를 업데이트합니다 (완료 시).
 */
export async function updateQuizpackStatistics(
    packId: number,
    correctCount: number,
    totalQuizCount: number
) {
    const supabase = createClient();
    const correctRate = totalQuizCount > 0 ? (correctCount / totalQuizCount) * 100 : 0;

    // 기존 통계 조회
    const { data: existing } = await supabase
        .from('quizpack_statistics')
        .select('*')
        .eq('quizpack_id', packId)
        .maybeSingle();

    if (existing) {
        // 기존 통계 업데이트 (누적)
        const newTotalCompletions = (existing.total_completions || 0) + 1;
        const newTotalCorrectCount = (existing.total_correct_count || 0) + correctCount;
        const newTotalQuizCount = (existing.total_quiz_count || 0) + totalQuizCount;
        const newAverageCorrectRate = newTotalQuizCount > 0
            ? (newTotalCorrectCount / newTotalQuizCount) * 100
            : 0;

        const { error } = await supabase
            .from('quizpack_statistics')
            .update({
                total_completions: newTotalCompletions,
                total_correct_count: newTotalCorrectCount,
                total_quiz_count: newTotalQuizCount,
                average_correct_rate: newAverageCorrectRate,
            })
            .eq('quizpack_id', packId);

        if (error) {
            console.error('퀴즈팩 통계 업데이트 에러:', error);
            throw error;
        }
    } else {
        // 새 통계 생성
        const { error } = await supabase
            .from('quizpack_statistics')
            .insert({
                quizpack_id: packId,
                total_completions: 1,
                total_correct_count: correctCount,
                total_quiz_count: totalQuizCount,
                average_correct_rate: correctRate,
            });

        if (error) {
            console.error('퀴즈팩 통계 생성 에러:', error);
            throw error;
        }
    }
}

/**
 * 사용자의 퀴즈팩 평점을 저장합니다.
 */
export async function saveQuizpackRating(
    userId: number,
    packId: number,
    rating: number
) {
    const supabase = createClient();

    // 기존 평점 조회
    const { data: existing } = await supabase
        .from('user_quizpack_ratings')
        .select('id')
        .eq('user_id', userId)
        .eq('quizpack_id', packId)
        .maybeSingle();

    if (existing) {
        // 기존 평점 업데이트
        const { error } = await supabase
            .from('user_quizpack_ratings')
            .update({ rating })
            .eq('id', existing.id);

        if (error) {
            console.error('평점 업데이트 에러:', error);
            throw error;
        }
    } else {
        // 새 평점 생성
        const { error } = await supabase
            .from('user_quizpack_ratings')
            .insert({
                user_id: userId,
                quizpack_id: packId,
                rating,
            });

        if (error) {
            console.error('평점 생성 에러:', error);
            throw error;
        }
    }

    // quizpack_statistics의 평점 집계 업데이트
    await updateQuizpackAverageRating(packId);
}

/**
 * 퀴즈팩의 평균 평점을 업데이트합니다.
 */
async function updateQuizpackAverageRating(packId: number) {
    const supabase = createClient();

    // 해당 퀴즈팩의 모든 평점 조회
    const { data: ratings } = await supabase
        .from('user_quizpack_ratings')
        .select('rating')
        .eq('quizpack_id', packId);

    if (!ratings || ratings.length === 0) return;

    const ratingSum = ratings.reduce((sum, r) => sum + r.rating, 0);
    const ratingCount = ratings.length;
    const averageRating = ratingSum / ratingCount;

    // quizpack_statistics 업데이트
    const { data: existing } = await supabase
        .from('quizpack_statistics')
        .select('id')
        .eq('quizpack_id', packId)
        .maybeSingle();

    if (existing) {
        await supabase
            .from('quizpack_statistics')
            .update({
                rating_count: ratingCount,
                rating_sum: ratingSum,
                average_rating: averageRating,
            })
            .eq('quizpack_id', packId);
    }
}
