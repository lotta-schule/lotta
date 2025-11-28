import * as React from 'react';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import {
  addBusinessDays,
  isSameDay,
  parse,
  subBusinessDays,
  format,
} from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Button,
  ErrorMessage,
  LinearProgress,
  Table,
  Tooltip,
} from '@lotta-schule/hubert';
import { useApolloClient, useLazyQuery } from '@apollo/client/react';
import { WidgetModel, ScheduleResult, WidgetModelType } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { SelectCoursesDialog } from './SelectCoursesDialog';
import Link from 'next/link';

import clsx from 'clsx';

import GetScheduleQuery from 'api/query/GetScheduleQuery.graphql';

import styles from './Schedule.module.scss';

import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'shared/Icon';

export const LOCALSTORAGE_KEY = 'lotta-schedule-courses';

type DateString = string;

export interface ScheduleProps {
  widget: WidgetModel<WidgetModelType.Schedule>;
}

const dateToDateString = (date: Date | string) =>
  format(new Date(date), 'yyyy-MM-dd');

export const Schedule = React.memo<ScheduleProps>(({ widget }) => {
  const currentUser = useCurrentUser();
  const [isSelectCoursesDialogOpen, setIsSelectCoursesDialogOpen] =
    React.useState(false);
  const [selectedCourses, setSelectedCourses] = React.useState<string[] | null>(
    null
  );
  const [currentDate, setCurrentDate] = React.useState<
    DateString | undefined
  >();

  const client = useApolloClient();
  const [
    getCurrentScheduleData,
    {
      data: currentScheduleData,
      error: currentScheduleError,
      loading: isLoading,
    },
  ] = useLazyQuery<{
    schedule: ScheduleResult | null;
  }>(GetScheduleQuery, { errorPolicy: 'all' });
  const [getLastSchedule, { data: lastScheduleData }] = useLazyQuery<{
    schedule: ScheduleResult | null;
  }>(GetScheduleQuery, { errorPolicy: 'all' });
  const [getNextSchedule, { data: nextScheduleData }] = useLazyQuery<{
    schedule: ScheduleResult | null;
  }>(GetScheduleQuery, { errorPolicy: 'all' });

  const getAvailableDate = React.useCallback(
    (direction: 'previous' | 'next', startDateString: DateString): Date => {
      const startDate = parse(startDateString, 'yyyy-MM-dd', new Date(), {
        locale: de,
      });
      const newDate =
        direction === 'previous'
          ? subBusinessDays(startDate, 1)
          : addBusinessDays(startDate, 1);

      if (
        !currentScheduleData?.schedule?.head.skipDates.find((skipDate) =>
          isSameDay(new Date(skipDate), newDate)
        )
      ) {
        return newDate;
      }
      return getAvailableDate(direction, dateToDateString(newDate));
    },
    [currentScheduleData]
  );

  React.useEffect(() => {
    if (currentUser?.class) {
      getCurrentScheduleData({
        variables: { widgetId: widget.id, date: currentDate },
      }).then(({ data }) => {
        if (data?.schedule) {
          const newDateString = dateToDateString(
            parse(data.schedule.head.date, 'PPPP', new Date(), {
              locale: de,
            })
          );
          if (!currentDate) {
            client.writeQuery({
              query: GetScheduleQuery,
              variables: { widgetId: widget.id, date: newDateString },
              data,
              broadcast: false,
            });
            setCurrentDate(newDateString);
          }
        }
      });
    }
  }, [currentUser, currentDate, getCurrentScheduleData, widget.id, client]);

  React.useEffect(() => {
    if (currentDate) {
      getLastSchedule({
        variables: {
          widgetId: widget.id,
          date: dateToDateString(getAvailableDate('previous', currentDate)),
        },
      });
      getNextSchedule({
        variables: {
          widgetId: widget.id,
          date: dateToDateString(getAvailableDate('next', currentDate)),
        },
      });
    }
  }, [
    widget.id,
    currentDate,
    getAvailableDate,
    getLastSchedule,
    getNextSchedule,
  ]);

  const tableRows = React.useMemo(() => {
    if (!currentUser) {
      return [];
    }
    const rows = flatten(
      Array.from(currentScheduleData?.schedule?.body?.schedule ?? [])
        .sort((l1, l2) => l1.lessonIndex - l2.lessonIndex)
        .filter((line) => {
          if (
            selectedCourses !== null &&
            ['11', '12'].indexOf(currentUser.class!) > -1
          ) {
            return selectedCourses.indexOf(line.lessonName) > -1;
          }
          return true;
        })
        .map((line, index) =>
          [
            <tr key={index * 2}>
              <td>{line.lessonIndex}</td>
              <td
                className={clsx({
                  [styles.updated]: line.lessonNameHasChanged,
                })}
              >
                {line.lessonName}
              </td>
              <td
                className={clsx({
                  [styles.updated]: line.teacherHasChanged,
                })}
              >
                {line.teacher === '&nbsp;' ? '---' : line.teacher}
              </td>
              <td
                className={clsx({
                  [styles.updated]: line.roomHasChanged,
                })}
              >
                {line.room === '&nbsp;' ? '---' : line.room}
              </td>
            </tr>,
          ].concat(
            line.comment
              ? [
                  <tr key={index * 2 + 1}>
                    <td colSpan={4} align={'right'}>
                      {line.comment}
                    </td>
                  </tr>,
                ]
              : []
          )
        )
    );
    if (rows.length < 1) {
      return [
        <tr key={-1}>
          <td colSpan={4} align={'center'}>
            Kein Vertretungsplan
          </td>
        </tr>,
      ];
    }
    return rows;
  }, [currentScheduleData, selectedCourses, currentUser]);

  if (!currentUser) {
    return (
      <ErrorMessage
        error={
          new Error('Du musst angemeldet sein um den Vertretungsplan zu sehen.')
        }
      />
    );
  } else if (!currentUser.class) {
    const errorMessage =
      widget.configuration?.type === 'IndiwareTeacher'
        ? 'Sie haben kein Kürzel im Profil eingestellt.'
        : 'Du hast keine Klasse im Profil eingestellt.';
    return (
      <>
        <ErrorMessage error={new Error(errorMessage)} />
        <Link href={'/profile'}>Mein Profil öffnen</Link>
      </>
    );
  }

  if (isLoading) {
    return (
      <LinearProgress isIndeterminate aria-label={'Stundenplan wird geladen'} />
    );
  } else if (currentScheduleError) {
    return <ErrorMessage error={currentScheduleError} />;
  } else if (currentScheduleData && currentScheduleData.schedule) {
    return (
      <div className={styles.root}>
        {['11', '12'].indexOf(currentUser.class) > -1 && (
          <div className={styles.selectCoursesLinkWrapper}>
            <a href={'#'} onClick={() => setIsSelectCoursesDialogOpen(true)}>
              Kurse wählen
            </a>
          </div>
        )}
        <div className={styles.date}>
          {lastScheduleData?.schedule ? (
            <Tooltip label={lastScheduleData.schedule.head.date}>
              <Button
                aria-label={lastScheduleData.schedule.head.date}
                icon={<Icon icon={faChevronLeft} size="lg" />}
                onClick={() =>
                  setCurrentDate(
                    dateToDateString(
                      parse(
                        lastScheduleData.schedule!.head.date,
                        'PPPP',
                        new Date(),
                        { locale: de }
                      )
                    )
                  )
                }
              />
            </Tooltip>
          ) : (
            <div style={{ width: 48 }} />
          )}
          <span>{currentScheduleData.schedule.head?.date}</span>
          {nextScheduleData?.schedule ? (
            <Tooltip label={nextScheduleData.schedule.head.date}>
              <Button
                aria-label={nextScheduleData.schedule.head.date}
                icon={<Icon icon={faChevronRight} size="lg" />}
                onClick={() =>
                  setCurrentDate(
                    dateToDateString(
                      parse(
                        nextScheduleData.schedule!.head.date,
                        'PPPP',
                        new Date(),
                        { locale: de }
                      )
                    )
                  )
                }
              />
            </Tooltip>
          ) : (
            <div style={{ width: 48 }} />
          )}
        </div>
        {currentScheduleData.schedule.body && (
          <>
            <Table>
              <tbody>{tableRows}</tbody>
            </Table>
            <SelectCoursesDialog
              isOpen={isSelectCoursesDialogOpen}
              possibleCourses={uniq([
                ...(lastScheduleData?.schedule?.body?.schedule.map(
                  (schedule) => schedule.lessonName
                ) ?? []),
                ...(nextScheduleData?.schedule?.body?.schedule.map(
                  (schedule) => schedule.lessonName
                ) ?? []),
                ...(currentScheduleData.schedule?.body?.schedule.map(
                  (schedule) => schedule.lessonName
                ) ?? []),
              ])}
              onRequestClose={() => {
                try {
                  const persistedCourseList =
                    localStorage.getItem(LOCALSTORAGE_KEY);
                  if (persistedCourseList) {
                    setSelectedCourses(JSON.parse(persistedCourseList));
                  }
                } catch {
                  console.error(
                    'Could not load selected courses from local storage'
                  );
                }
                setIsSelectCoursesDialogOpen(false);
              }}
            />
          </>
        )}
        {currentScheduleData.schedule.footer?.supervisions && (
          <ul>
            {currentScheduleData.schedule.footer.supervisions
              .filter(Boolean)
              .map((supervision, i) => (
                <li key={i}>
                  {supervision.time} {supervision.location}
                </li>
              ))}
          </ul>
        )}
        {currentScheduleData.schedule.footer?.comments && (
          <ul style={{ margin: '0.5em 0.5em 0 0.5em' }}>
            {currentScheduleData.schedule.footer.comments.map((comment, i) => (
              <li key={i} className={styles.notes}>
                {comment}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  return null;
});
Schedule.displayName = 'Schedule';
