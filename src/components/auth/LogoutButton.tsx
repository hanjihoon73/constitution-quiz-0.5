'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
    const router = useRouter();
    const { signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 text-gray-600"
        >
            <LogOut className="h-4 w-4" />
            로그아웃
        </Button>
    );
}
