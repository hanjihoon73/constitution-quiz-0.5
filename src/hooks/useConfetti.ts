import confetti from 'canvas-confetti';
import { useCallback } from 'react';

/**
 * 콘페티(축하 꽃가루) 효과를 발생시키는 커스텀 훅
 */
export const useConfetti = () => {
    const fireConfetti = useCallback(() => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            zIndex: 9999,
        };

        function fire(particleRatio: number, opts: confetti.Options) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        fire(0.2, {
            spread: 60,
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }, []);

    return { fireConfetti };
};
