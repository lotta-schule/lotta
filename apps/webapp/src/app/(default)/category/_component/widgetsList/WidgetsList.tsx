'use client';

import * as React from 'react';
import { useSuspenseQuery } from '@apollo/client/react';
import { graphql } from 'api/graphql';
import { WidgetModelType } from 'model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import {
  Tabbar,
  Tab,
  SwipeableViews,
  useScrollEvent,
} from '@lotta-schule/hubert';
import { Widget } from '../widgets/Widget';
import { WidgetIcon } from '../widgets/WidgetIcon';
import { User, Widget as WidgetUtil } from 'util/model';
import { useCategoriesAncestorsForItem } from 'util/categories/useCategoriesAncestorsForItem';
import { useCurrentCategoryId } from 'util/path/useCurrentCategoryId';
import { CurrentUserAvatar } from 'shared/userAvatar/UserAvatar';
import clsx from 'clsx';

import styles from './WidgetsList.module.scss';

export const GET_WIDGETS_QUERY = graphql(`
  query GetWidgets($categoryId: ID!) {
    widgets(categoryId: $categoryId) {
      id
      title
      type
      configuration
      iconImageFile {
        id
      }
      calendarEvents {
        id
        start
        end
        summary
        description
        isFullDay
        calendar {
          id
        }
        recurrence {
          frequency
          interval
          until
          daysOfWeek
          daysOfMonth
          occurrences
        }
      }
      groups {
        id
      }
    }
  }
`);

export type WidgetsListProps = {
  categoryId?: string;
  children?: React.ReactNode | React.ReactNode[];
};

export const WidgetsList = ({ children, categoryId }: WidgetsListProps) => {
  const currentUser = useCurrentUser();
  const { data } = useSuspenseQuery(GET_WIDGETS_QUERY, {
    variables: { categoryId: categoryId! },
    skip: !categoryId,
  });

  const widgets = (data?.widgets ?? []).filter((widget) => {
    if (User.isAdmin(currentUser)) {
      return !!currentUser!.groups.find(
        (g) =>
          !widget?.groups?.length ||
          !!widget?.groups?.find((cg) => cg?.id === g.id)
      );
    }
    return true;
  });

  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 959px)').matches;

  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  const currentCategoryId = useCurrentCategoryId();
  const isSecondNavigationOpen =
    useCategoriesAncestorsForItem(currentCategoryId || '0').length > 0;

  const shownWidgets = isMobile
    ? [WidgetUtil.getProfileWidget(), ...widgets]
    : widgets;

  const [currentTabIndex, setCurrentTabIndex] = React.useState<number | null>(
    null
  );

  React.useEffect(() => {
    const storedIndex = localStorage.getItem(
      'widgetlist-last-selected-item-index'
    );
    setCurrentTabIndex(storedIndex ? parseInt(storedIndex) : 0);
  }, []);

  React.useEffect(() => {
    if (currentTabIndex !== null) {
      localStorage.setItem(
        'widgetlist-last-selected-item-index',
        String(currentTabIndex)
      );
    }
  }, [currentTabIndex]);

  React.useLayoutEffect(() => {
    if (wrapperRef.current && window.matchMedia('(min-width: 960px)').matches) {
      wrapperRef.current.style.height = `calc(100vh - ${
        wrapperRef.current.getBoundingClientRect().top
      }px - var(--lotta-spacing))`;
    }
  }, []);

  useScrollEvent(
    () => {
      const wrapper = wrapperRef.current;
      const top = wrapper?.getBoundingClientRect().top;
      if (wrapper && top && isMobile && widgets.length > 0) {
        wrapper.style.height = `calc(100vh - ${top}px - var(--lotta-spacing))`;
      }
    },
    200,
    [widgets.length]
  );

  if (currentTabIndex === null) {
    return null;
  }

  const activeTabIndex =
    currentTabIndex < shownWidgets.length ? currentTabIndex : 0;

  return (
    <div
      className={clsx(styles.root, {
        [styles.hasSecondNavigation]: isSecondNavigationOpen,
      })}
      style={
        isMobile
          ? undefined
          : {
              height: `calc(100vh - ${
                isSecondNavigationOpen ? '112px' : '72px'
              } - var(--lotta-spacing))`,
            }
      }
      data-testid={'WidgetsList'}
      ref={wrapperRef}
    >
      {shownWidgets.length > 1 && (
        <>
          <Tabbar
            className={styles.WidgetTabbar}
            value={activeTabIndex}
            aria-label={'Marginales Modul wählen'}
            onChange={(newTabIndex) =>
              setCurrentTabIndex(newTabIndex as number)
            }
          >
            {shownWidgets.map((widget, i) => (
              <Tab
                className={styles.WidgetTab}
                key={widget.id}
                title={widget.title}
                value={i}
                icon={
                  widget.type === WidgetModelType.UserNavigationMobile &&
                  currentUser ? (
                    <CurrentUserAvatar
                      style={{
                        width: 28,
                        height: 28,
                      }}
                    />
                  ) : (
                    <WidgetIcon
                      icon={(widget.configuration as any)?.icon}
                      size={36}
                    />
                  )
                }
              />
            ))}
          </Tabbar>
          <SwipeableViews
            className={styles.swipeableViewsContainer}
            selectedIndex={activeTabIndex}
            onChange={setCurrentTabIndex}
          >
            {shownWidgets.map((widget) => (
              <Widget key={widget.id} widget={widget} />
            ))}
          </SwipeableViews>
        </>
      )}
      {shownWidgets.length === 1 && (
        <Widget key={shownWidgets[0].id} widget={shownWidgets[0]} />
      )}
      {children}
    </div>
  );
};
WidgetsList.displayName = 'WidgetsList';
