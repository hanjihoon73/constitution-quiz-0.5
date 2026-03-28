import { getAdminActivities } from '@/actions/admin/activities';
import { ActivitiesClient } from '@/components/admin/ActivitiesClient';

export default async function AdminActivitiesPage() {
    // 1. 서버 사이드 데이터 집계 페치
    const activities = await getAdminActivities();

    return (
        <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    활동 관리
                </h2>
                <p className="text-slate-400 mt-3">
                    사용자의 서비스 이용과 활동 현황을 조회합니다.
                </p>
            </div>

            {/* Client Dashboard Component */}
            <ActivitiesClient
                initialActivities={activities}
                total={activities.length}
            />
        </div>
    );
}
