import { WEEK_START } from '@prisma/client';
import dayjsLib from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isoWeek from 'dayjs/plugin/isoWeek';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjsLib.extend(isoWeek);
dayjsLib.extend(advancedFormat);
dayjsLib.extend(isSameOrBefore);
dayjsLib.extend(isSameOrAfter);
dayjsLib.extend(relativeTime);
dayjsLib.extend(updateLocale);

export function createDayjs(weekStart: WEEK_START) {
    dayjsLib.updateLocale('en', { weekStart: weekStart === 'MONDAY' ? 1 : undefined });
    return dayjsLib;
}

export const dayjs = dayjsLib;
