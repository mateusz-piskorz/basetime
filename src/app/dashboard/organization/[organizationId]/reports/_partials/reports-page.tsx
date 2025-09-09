'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { TimeEntryReportChart } from '@/components/common/time-entry-report-chart';
import dayjs from 'dayjs';
import { useState } from 'react';
import { PeriodDropdown } from './period-dropdown';

export const ReportsPage = () => {
    const [startDate, setStartDate] = useState(dayjs().startOf('week').toDate());
    const [endDate, setEndDate] = useState(dayjs().endOf('week').toDate());

    return (
        <div className="space-y-8 py-8">
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 md:px-8">
                <DashboardHeading title="Reports" className="mb-0" />
                <PeriodDropdown startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
            </div>
            <div className="px-4 md:px-8">
                <TimeEntryReportChart />
            </div>
        </div>
    );
};
