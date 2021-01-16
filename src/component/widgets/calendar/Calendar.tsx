import React, { memo, useEffect, useState } from 'react';
import { List, ListItem, ListItemText, makeStyles, Divider, Tooltip, Typography, LinearProgress } from '@material-ui/core';
import { useApolloClient } from '@apollo/client';
import { format, intervalToDuration } from 'date-fns';
import { de } from 'date-fns/locale';
import { FiberManualRecord } from '@material-ui/icons';
import { lighten } from '@material-ui/core/styles';
import { GetCalendarQuery } from 'api/query/GetCalendarQuery';
import { CalendarEventModel } from 'model/CalendarEventModel';
import { WidgetModel, CalendarWidgetConfig, CalendarWidgetCalendarConfig } from 'model';
import { ErrorMessage } from 'component/general/ErrorMessage';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: `calc(100% - ${theme.spacing(2)}px)`,
    },
    list: {
        overflow: 'auto',
        marginBottom: '1em'
    },
    listItemTextDate: {
        width: '7.5em',
        flexShrink: 0
    },
    listItemTextEventDescription: {
        paddingLeft: '.5em',
        textAlign: 'right',
        hyphens: 'auto',
        wordBreak: 'break-word'
    },
    calendarColorDot: {
        verticalAlign: 'sub',
        paddingRight: '.5em'
    },
    tableline: {
        '&:hover': {
            backgroundColor: lighten(theme.palette.text.secondary, .8),
        }
    },
    figcaption: {
        textAlign: 'center',
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        '& > span': {
            padding: `${theme.spacing(1)}px ${theme.spacing(1)}px`,
        }
    }
}));

export interface CalendarProps {
    widget: WidgetModel<CalendarWidgetConfig>;
}

export const Calendar = memo<CalendarProps>(({ widget }) => {
    const styles = useStyles();

    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState<(CalendarEventModel & { calendar: CalendarWidgetCalendarConfig })[]>([])
    const [error, setError] = useState<Error | null>(null);

    const { calendars } = widget.configuration;
    const apolloClient = useApolloClient();

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        Promise.all(
            (calendars || [])
                .map(async calendar => {
                    const { data } =
                        await apolloClient
                            .query<{calendar: CalendarEventModel[];}>({ query: GetCalendarQuery, variables: { url: calendar.url, days: calendar.days } });
                    return data?.calendar.map(event => ({ ...event, calendar }));
                })
        ).then((eventsArr: any[]) => {
            setEvents(eventsArr.flat());
            setIsLoading(false);
        }).catch((err: Error) => {
            setIsLoading(false);
            setError(err);
        });
    }, [apolloClient, calendars]);

    if (isLoading) {
        return (
            <LinearProgress />
        );
    }

    if (error) {
        return (
            <ErrorMessage error={error} />
        );
    }

    if (events) {
        return (
            <div className={styles.root}>
                {calendars && calendars.length > 1 && (
                    <figcaption className={styles.figcaption}>
                        {calendars.map((calendar, i) => (
                            <Typography variant={'body2'} component={'figure'} key={i} aria-label={`Legende: ${calendar.name}`}>
                                <FiberManualRecord fontSize={'inherit'} htmlColor={calendar.color || 'red'} className={styles.calendarColorDot} />
                                <figcaption>{calendar.name}</figcaption>
                            </Typography>
                        ))}
                    </figcaption>
                )}
                <List dense className={styles.list}>
                    {[...events].sort((ev1, ev2) => new Date(ev1.start).getTime() - new Date(ev2.start).getTime()).map((event, i) => {
                        const duration = intervalToDuration({ start: new Date(event.start), end: new Date(event.end) });
                        const isMultipleDays =
                            (duration.days && duration.days > 1) ||
                            (duration.months && duration.months > 0) ||
                            (duration.years && duration.years > 0);
                        return (
                            <React.Fragment key={i}>
                                <ListItem className={styles.tableline} aria-label={`Ereignis: ${event.summary}`}>
                                    <ListItemText className={styles.listItemTextDate}>
                                        {calendars.length > 1 && (
                                            <FiberManualRecord fontSize={'inherit'} htmlColor={event.calendar.color || 'red'} className={styles.calendarColorDot} />
                                        )}
                                        {format(new Date(event.start), 'P', { locale: de })}
                                        {isMultipleDays && (
                                            <>
                                                -
                                                {format(new Date(event.end), 'P', { locale: de })}
                                            </>
                                        )}
                                    </ListItemText>
                                    <ListItemText className={styles.listItemTextEventDescription}>
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
