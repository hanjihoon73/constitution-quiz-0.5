/**
 * 초 단위 시간을 "X분 Y초" 형식으로 변환
 * 
 * @param seconds - 총 초
 * @returns 포맷된 시간 문자열
 */
export function formatTime(seconds: number): string {
    if (seconds < 0) return '0초';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
        return `${remainingSeconds}초`;
    }

    if (remainingSeconds === 0) {
        return `${minutes}분`;
    }

    return `${minutes}분 ${remainingSeconds}초`;
}

/**
 * 날짜를 "YYYY.MM.DD HH:MM" 형식으로 변환
 * 
 * @param dateString - ISO 날짜 문자열
 * @returns 포맷된 날짜 문자열
 */
export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
}
