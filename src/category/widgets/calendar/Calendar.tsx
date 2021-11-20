import * as React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    Tooltip,
    LinearProgress,
} from '@material-ui/core';
import { FiberManualRecord } from '@material-ui/icons';
import { useApolloClient } from '@apollo/client';
import { format, intervalToDuration } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEventModel } from 'model/CalendarEventModel';
import {
    WidgetModel,
    CalendarWidgetCalendarConfig,
    WidgetModelType,
} from 'model';
import { Divider } from 'shared/general/divider/Divider';
import { ErrorMessage } from 'shared/general/ErrorMessage';
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

    if (isLoading) {
        return <LinearProgress />;
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
                <List dense className={styles.list}>
                    {[...events]
                        .sort(
                            (ev1, ev2) =>
                                new Date(ev1.start).getTime() -
                                new Date(ev2.start).getTime()
                        )
                        .map((event, i) => {
                            const duration = intervalToDuration({
                                start: new Date(event.start),
                                end: new Date(event.end),
                            });
                            const isMultipleDays =
                                (duration.days && duration.days > 1) ||
                                (duration.months && duration.months > 0) ||
                                (duration.years && duration.years > 0) ||
                                false;
                            return (
                                <React.Fragment key={i}>
                                    <ListItem
                                        className={styles.tableline}
                                        aria-label={`Ereignis: ${event.summary}`}
                                    >
                                        <ListItemText
                                            className={clsx([
                                                styles.listItemTextDate,
                                                {
                                                    'has-dot':
                                                        calendars.length > 1,
                                                },
                                            ])}
                                        >
                                            {calendars.length > 1 && (
                                                <FiberManualRecord
                                                    fontSize={'inherit'}
                                                    htmlColor={
                                                        event.calendar.color ||
                                                        'red'
                                                    }
                                                    className={
                                                        styles.calendarColorDot
                                                    }
                                                />
                                            )}
                                            {format(
                                                new Date(event.start),
                                                'P',
                                                { locale: de }
                                            )}
                                            {isMultipleDays && (
                                                <>
                                                    -
                                                    {format(
                                                        new Date(event.end),
                                                        'P',
                                                        { locale: de }
                                                    )}
                                                </>
                                            )}
                                        </ListItemText>
                                        <ListItemText
                                            className={
                                                styles.listItemTextEventDescription
                                            }
                                        >
                                            <Tooltip title={event.description}>
                                                <span>{event.summary}</span>
                                            </Tooltip>
                                        </ListItemText>
                                    </ListItem>
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
