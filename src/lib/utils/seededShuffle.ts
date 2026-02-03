import seedrandom from 'seedrandom';

/**
 * 시드 기반 배열 셔플 함수
 * 같은 시드를 사용하면 항상 동일한 순서로 셔플됩니다.
 * 
 * @param array - 셔플할 배열
 * @param seed - 시드 값 (user_quizpack_id 등)
 * @returns 셔플된 새 배열
 */
export function seededShuffle<T>(array: T[], seed: number | string): T[] {
    const rng = seedrandom(seed.toString());
    const shuffled = [...array];

    // Fisher-Yates 셔플 알고리즘
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}
