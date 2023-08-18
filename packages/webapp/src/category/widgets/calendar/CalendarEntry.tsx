import * as React from 'react';
import { CalendarEventModel } from 'model/CalendarEventModel';
import { Divider, ListItem } from '@lotta-schule/hubert';
import { format, intervalToDuration, isSameMinute } from 'date-fns';
import { de } from 'date-fns/locale';
import clsx from 'clsx';

import styles from './CalendarEntry.module.scss';
import { Icon } from 'shared/Icon';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

export type CalendarEntryProps = {
    event: CalendarEventModel;
    dot?: string | null;
};

const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
};

export const CalendarEntry = React.memo<CalendarEntryProps>(
    ({ event, dot }) => {
        const summary = stripHtml(event.summary);
        const description = stripHtml(event.description);
        const start = new Date(event.start);
        const end = new Date(event.end);

        const duration = intervalToDuration({
            start,
            end: new Date(end.getTime() - 1),
        });
        const isMultipleDays =
            (duration.days && duration.days >= 1) ||
            (duration.months && duration.months > 0) ||
            (duration.years && duration.years > 0) ||
            false;

        return (
            <div className={styles.root}>
                <ListItem
                    className={styles.tableline}
                    aria-label={`Ereignis: ${summary}`}
                    leftSection={
                        <div
                            className={clsx([
                                styles.listItemTextDate,
                                {
                                    'has-dot': !!dot,
                                },
                            ])}
                        >
                            <div>
                                {!!dot && (
                                    <Icon
                                        icon={faCircle}
                                        size="xl"
                                        style={{ color: dot }}
                                        className={styles.calendarColorDot}
                                    />
                                )}
                                {format(start, 'P', {
                                    locale: de,
                                })}
                                {isMultipleDays && (
                                    <>
                                        {' '}
                                        -{' '}
                                        {format(end, 'P', {
                                            locale: de,
                                        })}
                                    </>
                                )}
                            </div>
                            {!(
                                start.getUTCHours() === 0 ||
                                end.getUTCHours() === 0
                            ) && (
                                <time className={styles.time}>
                                    {format(start, 'p', {
                                        locale: de,
                                    })}
                                    {!isSameMinute(start, end) && (
                                        <>
                                            {' '}
                                            -{' '}
                                            {format(end, 'p', {
                                                locale: de,
                                            })}
                                        </>
                                    )}
                                </time>
                            )}
                        </div>
                    }
                    rightSection={
                        <div className={styles.listItemTextEventDescription}>
                            {summary}
                        </div>
                    }
                ></ListItem>
                {description && (
                    <ListItem className={styles.description}>
                        {description}
                    </ListItem>
                )}
                <Divider />
            </div>
        );
    }
);
CalendarEntry.displayName = 'CalendarEntry';
