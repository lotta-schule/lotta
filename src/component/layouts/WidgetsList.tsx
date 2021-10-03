import * as React from 'react';
import { WidgetModel, WidgetModelType } from 'model';
import { useIsMobile } from 'util/useIsMobile';
import { useLocalStorage } from 'util/useLocalStorage';
import { Tabs, Tab } from '@material-ui/core';
import { Widget } from 'component/widgets/Widget';
import { Widget as WidgetUtil } from 'util/model';
import { useCategoriesAncestorsForItem } from 'util/categories/useCategoriesAncestorsForItem';
import { useCurrentCategoryId } from 'util/path/useCurrentCategoryId';
import { useScrollEvent } from 'util/useScrollEvent';
import { WidgetIcon } from 'component/widgets/WidgetIcon';
import { CurrentUserAvatar } from 'component/user/UserAvatar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import SwipeableViews from 'react-swipeable-views';
import clsx from 'clsx';

import styles from './WidgetsList.module.scss';

export interface WidgetsListProps {
    widgets: WidgetModel[];
    children?: JSX.Element;
}

export const WidgetsList = React.memo<WidgetsListProps>(
    ({ widgets, children }) => {
        const isMobile = useIsMobile();
        const wrapperRef = React.useRef<HTMLDivElement | null>(null);

        const currentUser = useCurrentUser();
        const currentCategoryId = useCurrentCategoryId();
        const isSecondNavigationOpen =
            useCategoriesAncestorsForItem(currentCategoryId || '0').length > 0;

        const shownWidgets = isMobile
            ? [WidgetUtil.getProfileWidget(), ...widgets]
            : widgets;

        React.useLayoutEffect(() => {
            if (wrapperRef.current) {
                wrapperRef.current.style.height = `calc(100vh - ${
                    wrapperRef.current.getBoundingClientRect().top
                }px)`;
            }
        }, []);

        useScrollEvent(
            () => {
                if (wrapperRef.current && !isMobile && widgets.length > 0) {
                    wrapperRef.current.style.height = `calc(100vh - ${
                        wrapperRef.current.getBoundingClientRect().top
                    }px)`;
                }
            },
            200,
            [wrapperRef.current, isMobile, widgets.length]
        );

        const [currentTabIndex, setCurrentTabIndex] = useLocalStorage(
            'widgetlist-last-selected-item-index',
            0
        );

        const activeTabIndex =
            currentTabIndex < shownWidgets.length ? currentTabIndex : 0;

        const swipeableViews = (
            <SwipeableViews
                axis={'x'}
                index={activeTabIndex}
                onChangeIndex={(newIndex) => setCurrentTabIndex(newIndex)}
                className={styles.swipeableViewsContainer}
            >
                {shownWidgets.map((widget) => (
                    <Widget key={widget.id} widget={widget} />
                ))}
            </SwipeableViews>
        );

        return (
            <div
                className={clsx(styles.root, {
                    [styles.hasSecondNavigation]: isSecondNavigationOpen,
                })}
                data-testid={'WidgetsList'}
                ref={wrapperRef}
            >
                {shownWidgets && shownWidgets.length > 1 && (
                    <>
                        <Tabs
                            value={activeTabIndex}
                            variant={isMobile ? 'fullWidth' : 'scrollable'}
                            scrollButtons="auto"
                            aria-label={'Marginales Modul wählen'}
                            onChange={(_event, newTabIndex) =>
                                setCurrentTabIndex(newTabIndex)
                            }
                            classes={{
                                root: styles.tabsRoot,
                                flexContainer: styles.tabsFlexContainer,
                                scrollButtons: styles.tabsScrollButtons,
                                indicator: styles.tabsIndicator,
                            }}
                        >
                            {shownWidgets.map((widget, i) => (
                                <Tab
                                    key={widget.id}
                                    title={widget.title}
                                    value={i}
                                    icon={
                                        widget.type ===
                                            WidgetModelType.UserNavigationMobile &&
                                        currentUser ? (
                                            <CurrentUserAvatar
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                }}
                                            />
                                        ) : (
                                            <WidgetIcon
                                                icon={widget.configuration.icon}
                                                size={36}
                                            />
                                        )
                                    }
                                    classes={{
                                        root: styles.tabRoot,
                                        wrapper: styles.tabWrapper,
                                        selected: styles.tabSelected,
                                    }}
                                />
                            ))}
                        </Tabs>
                        {swipeableViews}
                    </>
                )}
                {shownWidgets && shownWidgets.length === 1 && swipeableViews}
                {children}
            </div>
        );
    }
);
WidgetsList.displayName = 'WidgetsList';
