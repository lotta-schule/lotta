import React, { memo, useEffect, useState } from 'react';
import { List, ListItem, ListItemText, makeStyles, Divider, CircularProgress, Tooltip, Typography } from '@material-ui/core';
import { GetCalendarQuery } from 'api/query/GetCalendarQuery';
import { CalendarEventModel } from 'model/CalendarEventModel';
import { useApolloClient } from '@apollo/react-hooks';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { WidgetModel, CalendarWidgetConfig, CalendarWidgetCalendarConfig } from 'model';
import { FiberManualRecord } from '@material-ui/icons';

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
            backgroundColor: '#f0f0f0',
        }
    },
    figcaption: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#fff',
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
                .map(calendar => {
                    return apolloClient
                        .query<{ calendar: CalendarEventModel[] }>({ query: GetCalendarQuery, variables: { url: calendar.url } })
                        .then(({ data: { calendar: events } }) => events.map(event => ({ ...event, calendar })));
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
            <CircularProgress />
        );
    } else if (error) {
        return (
            <span style={{ color: 'red' }}>{error.message}</span>
        );
    } else if (events) {
        return (
            <div className={styles.root}>
                <List dense className={styles.list}>
                    {events.sort((ev1, ev2) => new Date(ev1.start).getTime() - new Date(ev2.start).getTime()).map((event, i) => (
                        <React.Fragment key={i}>
                            <ListItem className={styles.tableline}>
                                <ListItemText className={styles.listItemTextDate}>
                                    {calendars.length > 1 && (
                                        <FiberManualRecord fontSize={'inherit'} htmlColor={event.calendar.color || 'red'} className={styles.calendarColorDot} />
                                    )}
                                    {format(parseISO(event.start), 'P', { locale: de })}
                                </ListItemText>
                                <ListItemText className={styles.listItemTextEventDescription}>
                                    <Tooltip title={event.description}>
                                        <span>{event.summary}</span>
                                    </Tooltip>
                                </ListItemText>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
                {calendars.length > 1 && (
                    <figcaption className={styles.figcaption}>
                        {calendars.map((calendar, i) => (
                            <Typography variant={'body2'} component={'span'} key={i}>
                                <FiberManualRecord fontSize={'inherit'} htmlColor={calendar.color || 'red'} className={styles.calendarColorDot} />
                                {calendar.name}
                            </Typography>
                        ))}
                    </figcaption>
                )}
            </div>
        );
    }
    return null;
});