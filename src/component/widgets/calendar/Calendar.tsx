import React, { memo } from 'react';
import { Typography, Paper, List, ListItem, ListItemText, makeStyles, Divider, CircularProgress, Tooltip } from '@material-ui/core';
import { GetCalendarQuery } from 'api/query/GetCalendarQuery';
import { CalendarEventModel } from 'model/CalendarEventModel';
import { useQuery } from '@apollo/react-hooks';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const useStyles = makeStyles(() => ({
    widget: {
        borderRadius: 0,
        marginTop: '0.5em',
        padding: '0.5em',
        borderLeft: '5px solid #699B4F',
    },
    list: {
        maxHeight: 300,
        overflow: 'auto'
    },
    tableline: {
        '&:hover': {
            backgroundColor: '#f0f0f0',
        }
    }
}));

const calendarUrl = 'https://calendar.google.com/calendar/ical/baethge%40ehrenberg-gymnasium.de/public/basic.ics';

export const Calendar = memo(() => {
    const styles = useStyles();

    const { data, loading: isLoading, error } = useQuery<{ calendar: CalendarEventModel[] }>(GetCalendarQuery, { variables: { url: calendarUrl } });

    let content: JSX.Element | null = null;

    if (isLoading) {
        content = (
            <CircularProgress />
        );
    } else if (error) {
        content = (
            <span style={{ color: 'red' }}>{error.message}</span>
        );
    } else if (data) {
        content = (
            <List dense className={styles.list}>
                {data.calendar.map(event => (
                    <React.Fragment key={event.uid}>
                        <ListItem className={styles.tableline}>
                            <ListItemText style={{ width: '9em' }}>
                                {format(parseISO(event.start), 'P', { locale: de })}
                            </ListItemText>
                            {/* <ListItemText>
                                16:00-18:00
                            </ListItemText> */}
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

    return (
        <Paper className={styles.widget}>
            <Typography variant={'body1'} style={{ margin: '0.5em 0', letterSpacing: 2, }}>
                Terminkalender
            </Typography>
            {content}
        </Paper>
    );
});