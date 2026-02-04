'use client';

interface ExitConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * 퀴즈 중단 확인 다이얼로그
 */
export function ExitConfirmDialog({ isOpen, onClose, onConfirm }: ExitConfirmDialogProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        console.log('[ExitConfirmDialog] 나가기 버튼 클릭됨');
        onConfirm();
    };

    return (
        <>
            {/* 배경 오버레이 */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9998,
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            />

            {/* 다이얼로그 */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    width: '280px',
                    zIndex: 9999,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                }}
            >
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    textAlign: 'center',
                }}>
                    퀴즈를 중단할까요?
                </h3>
                <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '24px',
                    textAlign: 'center',
                }}>
                    진행 상황은 저장됩니다.<br />
                    나중에 이어서 풀 수 있어요.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontWeight: '500',
                        }}
                    >
                        계속 풀기
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleConfirm();
                        }}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '500',
                        }}
                    >
                        나가기
                    </button>
                </div>
            </div>
        </>
    );
}
