import React, { memo } from 'react';
import { makeStyles, CircularProgress, Table, TableBody, TableRow, TableCell, Typography } from '@material-ui/core';
import { GetScheduleQuery } from 'api/query/GetScheduleQuery';
import { WidgetModel, ScheduleWidgetConfig, ScheduleResult } from 'model';
import { useQuery } from '@apollo/react-hooks';
import { useCurrentUser } from 'util/user/useCurrentUser';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'auto',
        height: '100%',
        '& td': {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2)
        }
    },
    date: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: `${theme.spacing(1)}px ${theme.spacing(1)}px`
    },
    updated: {
        color: '#dd3333',
        fontWeight: 'bolder'
    }
}));

export interface ScheduleProps {
    widget: WidgetModel<ScheduleWidgetConfig>;
}

export const Schedule = memo<ScheduleProps>(({ widget }) => {
    const styles = useStyles();
    const [currentUser] = useCurrentUser();
    const { data, loading: isLoading, error } = useQuery<{ schedule: ScheduleResult }>(GetScheduleQuery, { variables: { widgetId: widget.id }, skip: !currentUser || !currentUser.class });

    if (!currentUser) {
        return (
            <span style={{ color: 'red' }}>Du musst angemeldet sein um den Vertretungsplan zu sehen.</span>
        );
    } else if (!currentUser.class) {
        return (
            <span style={{ color: 'red' }}>
                {/Teacher/.test(widget.configuration.type) ?
                    'Sie haben kein Kürzel im Profil eingestellt.' :
                    'Du hast keine Klasse im Profil eingestellt.'}
            </span>
        );
    }

    if (isLoading) {
        return (
            <CircularProgress />
        );
    } else if (error) {
        return (
            <span style={{ color: 'red' }}>{error.message}</span>
        );
    } else if (data) {
        return (
            <div className={styles.root}>
                {data.schedule && (
                    <>
                        <Typography variant={'caption'} className={styles.date}>
                            {data.schedule.head.date}
                        </Typography>
                        {data.schedule.body && (
                            <Table size={'small'}>
                                <TableBody>
                                    {data.schedule.body.schedule.sort((l1, l2) => l1.lessonIndex - l2.lessonIndex).map(line => (
                                        <>
                                            <TableRow key={line.id}>
                                                <TableCell>{line.lessonIndex}</TableCell>
                                                <TableCell className={clsx({ [styles.updated]: line.lessonNameHasChanged })}>
                                                    {line.lessonName}
                                                </TableCell>
                                                <TableCell className={clsx({ [styles.updated]: line.teacherHasChanged })}>
                                                    {line.teacher === '&nbsp;' ? '-' : line.teacher}
                                                </TableCell>
                                                <TableCell className={clsx({ [styles.updated]: line.roomHasChanged })}>
                                                    {line.room}
                                                </TableCell>
                                            </TableRow>
                                            {line.comment && (
                                                <TableRow key={`${line.id}-comment`}>
                                                    <TableCell colSpan={4} align={'right'}>
                                                        <Typography variant={'subtitle2'}>
                                                            {line.comment}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {data.schedule.footer.comments && (
                            <Typography variant={'subtitle2'}>
                                {data.schedule.footer.comments.join('')}
                            </Typography>
                        )}
                    </>
                )
                }
            </div >
        );
    }
    return null;
});