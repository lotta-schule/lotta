import React, { memo, useEffect, useState } from 'react';
import { List, ListItem, ListItemText, makeStyles, Divider, CircularProgress, Tooltip } from '@material-ui/core';
import { GetCalendarQuery } from 'api/query/GetCalendarQuery';
import { CalendarEventModel } from 'model/CalendarEventModel';
import { useApolloClient } from '@apollo/react-hooks';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { WidgetModel, CalendarWidgetConfig } from 'model';

const useStyles = makeStyles(theme => ({
    list: {
        [theme.breakpoints.up('sm')]: {
            maxHeight: 300,
        },
        overflow: 'auto'
    },
    tableline: {
        '&:hover': {
            backgroundColor: '#f0f0f0',
        }
    }
}));

export interface CalendarProps {
    widget: WidgetModel<CalendarWidgetConfig>;
}

export const Calendar = memo<CalendarProps>(({ widget }) => {
    const styles = useStyles();

    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState<(CalendarEventModel & { calendar: CalendarWidgetConfig })[]>([])
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
        )
            .then((eventsArr: any[]) => setEvents(eventsArr.flat()))
            .catch((err: Error) => setError(err))
            .finally(() => setIsLoading(false));
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
            <List dense className={styles.list}>
                {events.map(event => (
                    <React.Fragment key={event.uid}>
                        <ListItem className={styles.tableline}>
                            <ListItemText style={{ width: '9em' }}>
                                {format(parseISO(event.start), 'P', { locale: de })}
                            </ListItemText>
                            <ListItemText style={{ paddingLeft: '.5em', textAlign: 'right', hyphens: 'auto', wordBreak: 'break-word' }}>
                                <Tooltip title={event.description}>
                                    <span>{event.summary}</span>
                                </Tooltip>
                            </ListItemText>
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
            </List>
        );
    }
    return null;
});