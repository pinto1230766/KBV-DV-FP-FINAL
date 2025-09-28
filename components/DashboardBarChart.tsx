import React, { useMemo } from 'react';
import { Visit } from '../types';

interface DashboardBarChartProps {
    visits: Visit[];
}

export const DashboardBarChart: React.FC<DashboardBarChartProps> = ({ visits }) => {

    const chartData = useMemo(() => {
        const now = new Date();
        const monthLabels: { month: string; year: number; key: string }[] = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthLabels.push({
                month: date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
                year: date.getFullYear(),
                key: `${date.getFullYear()}-${date.getMonth()}`
            });
        }

        const counts = new Map<string, number>();
        visits.forEach(v => {
            const visitDate = new Date(v.visitDate + 'T00:00:00');
            const key = `${visitDate.getFullYear()}-${visitDate.getMonth()}`;
            counts.set(key, (counts.get(key) || 0) + 1);
        });
        
        const dataPoints = monthLabels.map(label => ({
            month: label.month,
            count: counts.get(label.key) || 0
        }));

        const maxCount = Math.max(...dataPoints.map(d => d.count), 5); // Ensure a minimum height

        return { dataPoints, maxCount };
    }, [visits]);

    const { dataPoints, maxCount } = chartData;

    return (
        <div className="w-full h-full flex items-end">
            <svg width="100%" height="100%" className="text-xs">
                <g className="chart-grid">
                    {[...Array(5)].map((_, i) => {
                        const y = (i / 4) * 90; // 0%, 25%, 50%, 75%, 100% of 90% height
                        const value = Math.round(maxCount - (i * maxCount / 4));
                        return (
                             <g key={i}>
                                <line x1="25" x2="100%" y1={`${y}%`} y2={`${y}%`} className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="1" />
                                <text x="0" y={`${y}%`} dy="4" className="fill-current text-text-muted dark:text-text-muted-dark">{value}</text>
                             </g>
                        )
                    })}
                </g>
                 <g className="chart-bars" transform="translate(30, 0)">
                    {dataPoints.map((data, i) => {
                        const barHeight = data.count > 0 ? (data.count / maxCount) * 90 : 0;
                        const barWidth = 100 / (dataPoints.length * 2);
                        const x = i * (100 / dataPoints.length) + (barWidth / 2);

                        return (
                            <g key={data.month}>
                                <rect 
                                    x={`${x}%`} 
                                    y={`${90 - barHeight}%`} 
                                    width={`${barWidth}%`} 
                                    height={`${barHeight}%`} 
                                    className="fill-current text-primary dark:text-primary-light" 
                                    rx="2"
                                >
                                     <title>{`${data.month}: ${data.count} visite(s)`}</title>
                                </rect>
                                <text x={`${x + barWidth / 2}%`} y="95%" textAnchor="middle" className="fill-current text-text-muted dark:text-text-muted-dark font-semibold capitalize">{data.month}</text>
                            </g>
                        )
                    })}
                 </g>
            </svg>
        </div>
    );
};