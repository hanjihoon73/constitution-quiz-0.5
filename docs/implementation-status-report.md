# 프로젝트 상태 점검 및 정책 문서 비교 분석 보고서

## 1. 프로젝트 구현 상태 요약

### 기술 스택
- **프레임워크**: Next.js (App Router)
- **인증**: Supabase Auth (Google/Kakao OAuth)
- **DB**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS + shadcn/ui + lucide-react

### 구현된 기능 목록

| 기능 | 파일 | 상태 |
|------|------|------|
| 로그인 (Google/Kakao) | [login/page.tsx](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/app/login/page.tsx) | ✅ 완료 |
| 닉네임 설정 (온보딩) | [onboarding/page.tsx](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/app/onboarding/page.tsx) | ✅ 완료 |
| 인증 상태 관리 | [AuthProvider.tsx](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/components/auth/AuthProvider.tsx) | ✅ 완료 |
| 홈 (퀴즈팩 목록) | [page.tsx](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/app/page.tsx) | ✅ 완료 |
| 퀴즈팩 카드/목록 | [QuizpackCard.tsx](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/components/home/QuizpackCard.tsx) | ✅ 완료 |
| 퀴즈 풀기 | [quiz/[packId]/page.tsx](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/app/quiz/%5BpackId%5D/page.tsx) | ✅ 완료 |
| 퀴즈팩 완료 화면 | [complete/page.tsx](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/app/quiz/%5BpackId%5D/complete/page.tsx) | ✅ 완료 |
| 완료된 퀴즈팩 재시작 옵션 | [RestartOptionDialog.tsx](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/components/quiz/RestartOptionDialog.tsx) | ✅ 완료 |
| 퀴즈 중단 확인 | [ExitConfirmDialog.tsx](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/components/quiz/ExitConfirmDialog.tsx) | ✅ 완료 |
| 다음 퀴즈팩 해금 | [quiz.ts - unlockNextQuizpack](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/lib/api/quiz.ts#L489-L556) | ✅ 완료 |
| 프로필 화면 | - | ❌ 미구현 |
| 서비스 탈퇴 | - | ❌ 미구현 |

---

## 2. policy.md 정책 대비 구현 상태

### 3.1 로그인/로그아웃/계정 관리

| # | 정책 내용 | 구현 상태 | 비고 |
|---|----------|-----------|------|
| 1 | 구글/카카오 로그인 | ✅ 구현됨 | |
| 2 | 최초 로그인 시 닉네임 설정 + 중복 불가 | ✅ 구현됨 | |
| 3 | 프로필 화면에서 닉네임 수정 | ❌ 미구현 | 프로필 화면 자체가 없음 |
| 4 | 프로필에서 로그아웃/탈퇴 | ⚠️ 부분 구현 | `LogoutButton` 컴포넌트는 있으나, 프로필 화면에 연결되지 않음. 탈퇴 기능 없음 |
| 5 | 탈퇴 시 소셜 정보 삭제, 기록 유지 | ❌ 미구현 | 탈퇴 기능 전체 미구현 |

### 3.2 퀴즈팩

| # | 정책 내용 | 구현 상태 | 비고 |
|---|----------|-----------|------|
| 1 | 퀴즈팩 기본 순서 (quizpack_loadmap) | ✅ 구현됨 | |
| 2 | 4가지 상태 (opened/closed/in_progress/completed) | ✅ 구현됨 | |
| 3 | 최초 로그인 후 사용자 퀴즈팩 로드맵 생성 | ✅ 구현됨 | |
| 4 | 1번 퀴즈팩은 opened 상태 | ✅ 구현됨 | |
| 5 | 홈 이동 시 current_quizpack 자동 포커싱/강조 | ❌ 미구현 | 자동 스크롤이나 시각적 포커싱 없음 |
| 6 | current_quizpack = in_progress 또는 opened | ⚠️ 부분 구현 | 개념은 있으나 UI에서 명확한 강조 없음 |
| 7 | closed 퀴즈팩 시작 불가 알림 | ✅ 구현됨 | 토스트로 안내 |
| 8 | 진행 중 퀴즈팩 있을 때 다른 퀴즈팩 시작 시 경고 | ❌ 미구현 | **가장 중요한 미구현 사항** |
| 9 | in_progress는 1개, opened도 1개만 가능 | ❌ 미구현 | 제약 조건 미적용 |
| 10 | 이전 퀴즈팩 completed → 다음 퀴즈팩 opened | ✅ 구현됨 | |

### 3.3 퀴즈

| # | 정책 내용 | 구현 상태 | 비고 |
|---|----------|-----------|------|
| 1 | 퀴즈 최대 10개 | ✅ 구현됨 | DB에서 관리 |
| 2 | 3가지 유형 (선다/OX/빈칸채우기) | ✅ 구현됨 | |
| 3 | 힌트 + 결과 후 풀이 자동 표시 | ✅ 구현됨 | |
| 4 | 퀴즈별 정오답 저장 | ✅ 구현됨 | |
| 5 | 답안 기록된 퀴즈는 결과만 조회 가능 | ✅ 구현됨 | |
| 6 | 완료 화면에서 '다시풀기' 또는 '결과보기' 선택 | ⚠️ 부분 구현 | 완료 화면에 '다시풀기'와 '결과보기' 버튼이 없음 (홈에서 RestartOptionDialog로만 제공) |
| 7 | in_progress 이어하기 | ✅ 구현됨 | |
| 8 | 완료 퀴즈팩 재시작 시 '결과보기'/'다시풀기' 선택 | ✅ 구현됨 | |
| 9 | 결과보기 = 마지막 완료 시점 1번부터 조회 | ✅ 구현됨 | |
| 10 | 다시풀기 = 1번부터 새로 풀기 | ✅ 구현됨 | |

---

## 3. quizpack_progress.png 다이어그램 대비 불일치

> [!IMPORTANT]
> 다이어그램은 퀴즈팩 상태 전환의 **전체 시나리오**를 보여줍니다. 아래는 다이어그램에서 나타나는 흐름과 코드 구현 간의 주요 차이점입니다.

### 불일치 ① "aborted" (중단) 처리 로직 미구현

다이어그램에서 `aborted`는 다음 시나리오를 나타냅니다:

1. 완료된(completed) 2번 퀴즈팩의 [다시풀기]를 시작 → 상태가 `in_progress`로 변경
2. 2번(in_progress)을 진행하다 [나가기]로 중단(aborted) → 홈으로 이동
3. 중단한 2번 퀴즈팩은 여전히 `in_progress` 상태
4. 완료된(completed) 1번 퀴즈팩의 [다시풀기]를 시작
5. **1번이 `in_progress`로 바뀌고, 2번은 직전의 `completed` 상태로 복원됨**

즉, **다른 퀴즈팩을 시작하면 기존 `in_progress`였던 퀴즈팩이 직전 상태로 자동 복원**되어야 합니다.

- **정책 2-8**: *"진행 중 상태의 퀴즈팩이 있을 때, 홈에서 다른 상태(열림 또는 완료)의 퀴즈팩을 시작하면 기존에 진행 중이던 퀴즈팩의 기록이 초기화된다고 알려주고 선택권을 줘야 함"*
- **현재 코드**: [QuizpackCard.tsx](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/components/home/QuizpackCard.tsx#L21-L41)에서 다른 퀴즈팩 클릭 시 **경고 없이 바로 진입**하며, 기존 `in_progress` 퀴즈팩의 상태 복원 로직도 없습니다.

### 불일치 ② 진행 중(in_progress)과 열림(opened) 상태의 단일 제약

다이어그램에서는 항상 `in_progress`가 최대 1개, `opened`가 최대 1개만 존재합니다.

- **정책 2-9**: *"사용자는 진행 중 상태의 퀴즈팩과 열림 상태의 퀴즈팩이 각각 1개씩만 존재할 수 있음"*
- **현재 코드**: 이 제약 조건이 코드 수준에서 검증되지 않습니다. 여러 퀴즈팩이 동시에 `in_progress`나 `opened` 상태가 될 수 있습니다.

### 불일치 ③ 완료(complete) 화면에서 '다시풀기'와 '결과보기' 부재

- **정책 3-6**: *"모든 퀴즈를 다 풀면 퀴즈팩 완료 화면을 보여주고, 여기서 '다시풀기'를 선택하거나 '결과보기'를 선택해 각 퀴즈별 정오답 결과를 조회할 수 있음"*
- **현재 코드**: [complete/page.tsx](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/app/quiz/%5BpackId%5D/complete/page.tsx)에는 '다음 퀴즈팩 시작'과 '홈으로 돌아가기' 두 가지 버튼만 있음. **'다시풀기'와 '결과보기' 버튼이 없음**

### 불일치 ④ 홈에서 current_quizpack 자동 포커싱/강조

- **정책 2-5**: *"홈으로 이동할 때마다 사용자가 해야 할 퀴즈팩이 자동으로 포커싱 되고 강조 됨"*
- **현재 코드**: [QuizpackList.tsx](file:///d:/SynologyDrive/dev_projects/constitution-quiz-0.5/src/components/home/QuizpackList.tsx)에 자동 스크롤이나 특별한 시각적 포커싱 로직이 없음

---

## 4. 불일치 사항 우선순위 정리

| 우선순위 | 불일치 항목 | 영향도 | 관련 정책 |
|----------|------------|--------|-----------|
| 🔴 높음 | 진행 중 퀴즈팩 있을 때 다른 퀴즈팩 시작 시 경고 + 기존 상태 복원 미구현 | 사용자 데이터 손실 가능 | 2-8 |
| 🔴 높음 | in_progress/opened 단일 제약 미적용 | 상태 불일치 가능 | 2-9 |
| 🟡 중간 | 완료 화면에 '다시풀기' + '결과보기' 버튼 부재 | 사용자 경험 미완성 | 3-6 |
| 🟡 중간 | 프로필 화면 (닉네임 수정, 로그아웃, 탈퇴) 미구현 | 계정 관리 불가 | 1-3,4,5 |
| 🟢 낮음 | 홈에서 current_quizpack 자동 포커싱/강조 | UX 편의성 | 2-5,6 |
