import * as React from 'react';
import {
    Divider,
    ErrorMessage,
    List,
    ListItem,
    LinearProgress,
} from '@lotta-schule/hubert';
import { FiberManualRecord } from '@material-ui/icons';
import { useApolloClient } from '@apollo/client';
import { format, intervalToDuration, isSameMinute } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEventModel } from 'model/CalendarEventModel';
import {
    WidgetModel,
    CalendarWidgetCalendarConfig,
    WidgetModelType,
} from 'model';
import clsx from 'clsx';

import GetCalendarQuery from 'api/query/GetCalendarQuery.graphql';

import styles from './Calendar.module.scss';

export interface CalendarProps {
    widget: WidgetModel<WidgetModelType.Calendar>;
}

export const Calendar = React.memo<CalendarProps>(({ widget }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [events, setEvents] = React.useState<
        (CalendarEventModel & { calendar: CalendarWidgetCalendarConfig })[]
    >([]);
    const [error, setError] = React.useState<Error | null>(null);

    const calendars = React.useMemo(() => {
        return widget.configuration?.calendars ?? [];
    }, [widget.configuration]);
    const apolloClient = useApolloClient();

    React.useEffect(() => {
        setIsLoading(true);
        setError(null);
        Promise.all(
            (calendars || []).map(async (calendar) => {
                const { data } = await apolloClient.query<{
                    calendar: CalendarEventModel[];
                }>({
                    query: GetCalendarQuery,
                    variables: { url: calendar.url, days: calendar.days },
                });
                return data?.calendar.map((event) => ({ ...event, calendar }));
            })
        )
            .then((eventsArr: any[]) => {
                setEvents(eventsArr.flat());
                setIsLoading(false);
            })
            .catch((err: Error) => {
                setIsLoading(false);
                setError(err);
            });
    }, [apolloClient, calendars]);

    const stripHtml = (html: string) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    if (isLoading) {
        return (
            <LinearProgress
                isIndeterminate
                aria-label={'Kalenderdaten werden geladen'}
            />
        );
    }

    if (error) {
        return <ErrorMessage error={error} />;
    }

    if (events) {
        return (
            <div className={styles.root}>
                {calendars && calendars.length > 1 && (
                    <figcaption className={styles.figcaption}>
                        {calendars.map((calendar, i) => (
                            <figure
                                key={i}
                                aria-label={`Legende: ${calendar.name}`}
                            >
                                <FiberManualRecord
                                    fontSize={'inherit'}
                                    htmlColor={calendar.color || 'red'}
                                    className={styles.calendarColorDot}
                                />
                                <figcaption>{calendar.name}</figcaption>
                            </figure>
                        ))}
                    </figcaption>
                )}
                <List className={styles.list}>
                    {[...events]
                        .sort(
                            (ev1, ev2) =>
                                new Date(ev1.start).getTime() -
                                new Date(ev2.start).getTime()
                        )
                        .map((event, i) => {
                            const summary = stripHtml(event.summary);
                            const description = stripHtml(event.description);
                            const start = new Date(event.start);
                            const end = new Date(event.end);

                            const duration = intervalToDuration({
                                start,
                                end,
                            });
                            const isMultipleDays =
                                (duration.days && duration.days >= 1) ||
                                (duration.months && duration.months > 0) ||
                                (duration.years && duration.years > 0) ||
                                false;

                            return (
                                <React.Fragment key={i}>
                                    <ListItem
                                        className={styles.tableline}
                                        aria-label={`Ereignis: ${summary}`}
                                        leftSection={
                                            <div
                                                className={clsx([
                                                    styles.listItemTextDate,
                                                    {
                                                        'has-dot':
                                                            calendars.length >
                                                            1,
                                                    },
                                                ])}
                                            >
                                                <div>
                                                    {calendars.length > 1 && (
                                                        <FiberManualRecord
                                                            fontSize={'inherit'}
                                                            htmlColor={
                                                                event.calendar
                                                                    .color ||
                                                                'red'
                                                            }
                                                            className={
                                                                styles.calendarColorDot
                                                            }
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
                                                {!isMultipleDays && (
                                                    <div
                                                        className={styles.time}
                                                    >
                                                        {format(start, 'p', {
                                                            locale: de,
                                                        })}
                                                        {!isSameMinute(
                                                            start,
                                                            end
                                                        ) && (
                                                            <>
                                                                {' '}
                                                                -{' '}
                                                                {format(
                                                                    end,
                                                                    'p',
                                                                    {
                                                                        locale: de,
                                                                    }
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        }
                                        rightSection={
                                            <div
                                                className={
                                                    styles.listItemTextEventDescription
                                                }
                                            >
                                                {summary}
                                            </div>
                                        }
                                    ></ListItem>
                                    {description && (
                                        <ListItem
                                            className={styles.description}
                                        >
                                            {description}
                                        </ListItem>
                                    )}
                                    <Divider />
                                </React.Fragment>
                            );
                        })}
                </List>
            </div>
        );
    }
    return null;
});
Calendar.displayName = 'CalendarWidget';
