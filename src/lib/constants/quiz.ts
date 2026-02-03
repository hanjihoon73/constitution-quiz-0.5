// 퀴즈 관련 상수

// 퀴즈팩당 최대 퀴즈 수
export const MAX_QUIZ_PER_PACK = 10;

// 닉네임 유효성 검사 정규식
export const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{4,20}$/;

// 닉네임 최소/최대 길이
export const NICKNAME_MIN_LENGTH = 4;
export const NICKNAME_MAX_LENGTH = 20;

// 빈칸채우기 최대 빈칸 수
export const MAX_BLANK_COUNT = 3;

// 선호도 점수 범위
export const RATING_MIN = 1;
export const RATING_MAX = 5;

// 정오답 효과 지속 시간 (밀리초)
export const ANSWER_EFFECT_DURATION = 2000;

// 퀴즈 네비게이션 최대 표시 개수
export const MAX_VISIBLE_NAV_ITEMS = 10;
