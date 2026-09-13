import React from 'react';
import PlanoBentoCard from './PlanoBentoCard';

const GRID = 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3';

// Skeletons no lugar do spinner: o grid não salta quando os cards chegam.
function GridSkeleton() {
    return (
        <div className={GRID}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[240px] animate-pulse rounded-2xl border border-border bg-surface" />
            ))}
        </div>
    );
}

export default function PlansGrid({ plans, isLoading, hasSearch, comparingIds = [], ...cardProps }) {
    if (isLoading) return <GridSkeleton />;

    if (plans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
                <span className="material-symbols-outlined mb-2 text-4xl text-muted">
                    {hasSearch ? 'search_off' : 'wifi_off'}
                </span>
                <p className="text-sm font-medium text-faint">
                    {hasSearch ? 'Nenhum plano encontrado para essa busca.' : 'Nenhum plano encontrado.'}
                </p>
            </div>
        );
    }

    return (
        <div className={GRID}>
            {plans.map(plan => (
                <PlanoBentoCard
                    key={plan.id}
                    plan={plan}
                    isComparing={comparingIds.includes(plan.id)}
                    {...cardProps}
                />
            ))}
        </div>
    );
}
