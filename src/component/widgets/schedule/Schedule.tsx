import * as React from 'react';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import { addBusinessDays, isSameDay, parse, subBusinessDays, format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
    makeStyles, LinearProgress, Table, TableBody, TableRow, TableCell, Typography, Link, IconButton, Tooltip
} from '@material-ui/core';
import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
import { darken } from '@material-ui/core/styles';
import { WidgetModel, ScheduleWidgetConfig, ScheduleResult } from 'model';
import { GetScheduleQuery } from 'api/query/GetScheduleQuery';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { SelectCoursesDialog } from './SelectCoursesDialog';
import { ArrowBackIos, ArrowForwardIos } from '@material-ui/icons';
import { CollisionLink } from 'component/general/CollisionLink';
import clsx from 'clsx';

export const LOCALSTORAGE_KEY = 'lotta-schedule-courses';

type DateString = string;

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
        },
        '& > span': { // the actual date
            display: 'flex',
            alignItems: 'center'
        }
    },
    selectCoursesLinkWrapper: {
        padding: theme.spacing(0, .5)
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

const dateToDateString = (date: Date | string) => format(new Date(date), 'yyyy-MM-dd');

export const Schedule = React.memo<ScheduleProps>(({ widget }) => {
    const styles = useStyles();
    const [currentUser] = useCurrentUser();
    const [isSelectCoursesDialogOpen, setIsSelectCoursesDialogOpen] = React.useState(false);
    const [selectedCourses, setSelectedCourses] = React.useState<string[] | null>(null);
    const [currentDate, setCurrentDate] = React.useState<DateString | undefined>();

    const client = useApolloClient();
    const { data: currentScheduleData, loading: isLoading, error: currentScheduleError } = useQuery<{ schedule: ScheduleResult | null }>(GetScheduleQuery, {
        variables: { widgetId: widget.id, date: currentDate },
        skip: !currentUser?.class,
        ssr: false,
        onCompleted: (data) => {
            if (data.schedule) {
                const newDateString = dateToDateString(parse(data.schedule.head.date, 'PPPP', new Date(), { locale: de }));
                if (!currentDate) {
                    client.writeQuery({ query: GetScheduleQuery, variables: { widgetId: widget.id, date: newDateString }, data, broadcast: false });
                }
                setCurrentDate(newDateString);
            }
        }
    });
    const [getLastSchedule, { data: lastScheduleData }] = useLazyQuery<{ schedule: ScheduleResult | null }>(GetScheduleQuery, { ssr: false, errorPolicy: 'all' });
    const [getNextSchedule, { data: nextScheduleData }] = useLazyQuery<{ schedule: ScheduleResult | null }>(GetScheduleQuery, { ssr: false, errorPolicy: 'all', onError: (() => {}) });

    const getAvailableDate = React.useCallback((direction: 'previous' | 'next', startDateString: DateString): Date => {
        const startDate = parse(startDateString, 'yyyy-MM-dd', new Date(), { locale: de });
        const newDate = direction === 'previous' ?
            subBusinessDays(startDate, 1) :
            addBusinessDays(startDate, 1);

        if (!currentScheduleData?.schedule?.head.skipDates.find(skipDate => isSameDay(new Date(skipDate), newDate))) {
            return newDate;
        }
        return getAvailableDate(direction, dateToDateString(newDate));
    }, [currentScheduleData]);

    React.useEffect(() => {
        if (currentDate) {
            getLastSchedule({ variables: { widgetId: widget.id, date: dateToDateString(getAvailableDate('previous', currentDate)) } });
            getNextSchedule({ variables: { widgetId: widget.id, date: dateToDateString(getAvailableDate('next', currentDate)) } });
        }
    }, [widget.id, currentDate, getAvailableDate, getLastSchedule, getNextSchedule]);

    const tableRows = React.useMemo(() => {
        if (!currentUser) {
            return [];
        }
        const rows = flatten(
            Array.from(currentScheduleData?.schedule?.body?.schedule ?? [])
                .sort((l1, l2) => l1.lessonIndex - l2.lessonIndex)
                .filter(line => {
                    if (selectedCourses !== null && ['11', '12'].indexOf(currentUser.class!) > -1) {
                        return selectedCourses.indexOf(line.lessonName) > -1;
                    }
                    return true;
                })
                .map((line, index) => (
                    [
                        <TableRow key={index * 2}>
                            <TableCell>{line.lessonIndex}</TableCell>
                            <TableCell className={clsx({ [styles.updated]: line.lessonNameHasChanged })}>
                                {line.lessonName}
                            </TableCell>
                            <TableCell className={clsx({ [styles.updated]: line.teacherHasChanged })}>
                                {line.teacher === '&nbsp;' ? '---' : line.teacher}
                            </TableCell>
                            <TableCell className={clsx({ [styles.updated]: line.roomHasChanged })}>
                                {line.room === '&nbsp;' ? '---' : line.room}
                            </TableCell>
                        </TableRow>
                    ].concat(line.comment ? [
                        <TableRow key={index * 2 + 1}>
                            <TableCell colSpan={4} align={'right'}>
                                <Typography variant={'subtitle2'}>{line.comment}</Typography>
                            </TableCell>
                        </TableRow>
                    ] : [])
                ))
        );
        if (rows.length < 1) {
            return [
                <TableRow key={-1}>
                    <TableCell colSpan={4} align={'center'}>
                        <Typography>Kein Vertretungsplan</Typography>
                    </TableCell>
                </TableRow>
            ];
        }
        return rows;
    }, [styles, currentScheduleData, selectedCourses, currentUser]);

    if (!currentUser) {
        return (
            <ErrorMessage error={new Error('Du musst angemeldet sein um den Vertretungsplan zu sehen.')} />
        );
    } else if (!currentUser.class) {
        const errorMessage = /Teacher/.test(widget.configuration.type) ?
            'Sie haben kein Kürzel im Profil eingestellt.' :
            'Du hast keine Klasse im Profil eingestellt.';
        return (
            <>
                <ErrorMessage error={new Error(errorMessage)} />
                <Link component={CollisionLink} to={'/profile'}>Mein Profil öffnen</Link>
            </>
        );
    }

    if (isLoading) {
        return (
            <LinearProgress />
        );
    } else if (currentScheduleError) {
        return (
            <ErrorMessage error={currentScheduleError} />
        );
    } else if (currentScheduleData && currentScheduleData.schedule) {
        return (
            <div className={styles.root}>
                {['11', '12'].indexOf(currentUser.class) > -1 && (
                    <Typography variant={'body2'} className={styles.selectCoursesLinkWrapper}>
                        <Link color={'secondary'} href={'#'} onClick={() => setIsSelectCoursesDialogOpen(true)}>Kurse wählen</Link>
                    </Typography>
                )}
                <Typography variant={'caption'} className={styles.date}>
                    {lastScheduleData?.schedule ? (
                        <Tooltip title={lastScheduleData.schedule.head.date}>
                            <IconButton onClick={() => setCurrentDate(dateToDateString(parse(lastScheduleData.schedule!.head.date, 'PPPP', new Date(), { locale: de })))}>
                                <ArrowBackIos />
                            </IconButton>
                        </Tooltip>
                    ) : <div style={{ width: 48 }} />}
                    <span>{currentScheduleData.schedule.head.date}</span>
                    {nextScheduleData?.schedule ? (
                        <Tooltip title={nextScheduleData.schedule.head.date}>
                            <IconButton onClick={() => setCurrentDate(dateToDateString(parse(nextScheduleData.schedule!.head.date, 'PPPP', new Date(), { locale: de })))}>
                                <ArrowForwardIos />
                            </IconButton>
                        </Tooltip>
                    ) : <div style={{ width: 48 }} />}
                </Typography>
                {currentScheduleData.schedule.body && (
                    <>
                        <Table size={'small'}>
                            <TableBody>
                                {tableRows}
                            </TableBody>
                        </Table>
                        <SelectCoursesDialog
                            isOpen={isSelectCoursesDialogOpen}
                            possibleCourses={uniq([
                                ...(lastScheduleData?.schedule?.body?.schedule.map(schedule => schedule.lessonName) ?? []),
                                ...(nextScheduleData?.schedule?.body?.schedule.map(schedule => schedule.lessonName) ?? []),
                                ...(currentScheduleData.schedule?.body?.schedule.map(schedule => schedule.lessonName) ?? []),
                            ])}
                            onClose={() => {
                                try {
                                    const persistedCourseList = localStorage.getItem(LOCALSTORAGE_KEY);
                                    if (persistedCourseList) {
                                        setSelectedCourses(JSON.parse(persistedCourseList));
                                    }
                                } catch { }
                                setIsSelectCoursesDialogOpen(false);
                            }}
                        />
                    </>
                )}
                {currentScheduleData.schedule.footer.supervisions && (
                    <ul>
                        {currentScheduleData.schedule.footer.supervisions.filter(Boolean).map((supervision, i) => (
                            <li key={i}>
                                <Typography variant={'subtitle2'}>{supervision.time} {supervision.location}</Typography>
                            </li>
                        ))}
                    </ul>
                )}
                {currentScheduleData.schedule.footer.comments && (
                    <ul style={{ margin: '0.5em 0.5em 0 0.5em' }}>
                        {currentScheduleData.schedule.footer.comments.map((comment, i) => (
                            <li key={i} className={styles.notes}>
                                <Typography variant={'subtitle2'}>{comment}</Typography>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
    return null;
});
