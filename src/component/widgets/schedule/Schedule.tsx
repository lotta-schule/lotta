import React, { memo, useState, useEffect } from 'react';
import { uniq } from 'lodash';
import {
    makeStyles, CircularProgress, Table, TableBody, TableRow, TableCell, Typography, Link
} from '@material-ui/core';
import { useQuery } from '@apollo/react-hooks';
import { darken } from '@material-ui/core/styles';
import { WidgetModel, ScheduleWidgetConfig, ScheduleResult } from 'model';
import { GetScheduleQuery } from 'api/query/GetScheduleQuery';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { SelectCoursesDialog } from './SelectCoursesDialog';
import clsx from 'clsx';

export const LOCALSTORAGE_KEY = 'lotta-schedule-courses';

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
        padding: `${theme.spacing(1)}px ${theme.spacing(1)}px`,
        '& a': {
            color: theme.palette.secondary.main
        }
    },
    updated: {
        color: darken(theme.palette.error.main, .3),
        fontWeight: 'bolder'
    },
    notes: {
        marginBottom: '0.5em',
        paddingLeft: '0.3em',
        borderLeft: '2px solid',
        borderColor: theme.palette.secondary.main,
    }
}));

export interface ScheduleProps {
    widget: WidgetModel<ScheduleWidgetConfig>;
}

export const Schedule = memo<ScheduleProps>(({ widget }) => {
    const styles = useStyles();
    const [currentUser] = useCurrentUser();
    const [isSelectCoursesDialogOpen, setIsSelectCoursesDialogOpen] = useState(false);
    const [selectedCourses, setSelectedCourses] = useState<string[] | null>(null);
    const { data, loading: isLoading, error } = useQuery<{ schedule: ScheduleResult }>(GetScheduleQuery, { variables: { widgetId: widget.id }, skip: !currentUser || !currentUser.class });

    useEffect(() => {
        if (isSelectCoursesDialogOpen === false) {
            try {
                const persistedCourseList = localStorage.getItem(LOCALSTORAGE_KEY);
                if (persistedCourseList) {
                    setSelectedCourses(JSON.parse(persistedCourseList));
                }
            } catch { }
        }
    }, [isSelectCoursesDialogOpen]);

    if (!currentUser) {
        return (
            <ErrorMessage error={new Error('Du musst angemeldet sein um den Vertretungsplan zu sehen.')} />
        );
    } else if (!currentUser.class) {
        const errorMessage = /Teacher/.test(widget.configuration.type) ?
            'Sie haben kein Kürzel im Profil eingestellt.' :
            'Du hast keine Klasse im Profil eingestellt.';
        return (
            <ErrorMessage error={new Error(errorMessage)} />
        );
    }

    if (isLoading) {
        return (
            <CircularProgress />
        );
    } else if (error) {
        return (
            <ErrorMessage error={error} />
        );
    } else if (data) {
        return (
            <div className={styles.root}>
                {data.schedule && (
                    <>
                        <Typography variant={'caption'} className={styles.date}>
                            <span>{data.schedule.head.date}</span>
                            {['11', '12'].indexOf(currentUser.class) > -1 && (
                                <Link color={'secondary'} href={'#'} onClick={() => setIsSelectCoursesDialogOpen(true)}>Kurse</Link>
                            )}
                        </Typography>
                        {data.schedule.body && (
                            <>
                                <Table size={'small'}>
                                    <TableBody>
                                        {data.schedule.body.schedule
                                            .sort((l1, l2) => l1.lessonIndex - l2.lessonIndex)
                                            .filter(line => {
                                                if (selectedCourses !== null && ['11', '12'].indexOf(currentUser.class!) > -1) {
                                                    return selectedCourses.indexOf(line.lessonName) > -1;
                                                }
                                                return true;
                                            })
                                            .map(line => (
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
                                <SelectCoursesDialog
                                    isOpen={isSelectCoursesDialogOpen}
                                    possibleCourses={uniq(data.schedule.body.schedule.map(schedule => schedule.lessonName))}
                                    onClose={() => setIsSelectCoursesDialogOpen(false)}
                                />
                            </>
                        )}
                        {data.schedule.footer.supervisions && (
                            <ul>
                                {data.schedule.footer.supervisions.filter(Boolean).map(supervision => (
                                    <li>
                                        <Typography variant={'subtitle2'}>{supervision.time} {supervision.location}</Typography>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {data.schedule.footer.comments && (
                            <ul style={{ margin: '0.5em 0.5em 0 0.5em' }}>
                                {data.schedule.footer.comments.map(comment => (
                                    <li className={styles.notes}>
                                        <Typography variant={'subtitle2'}>{comment}</Typography>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
        );
    }
    return null;
});