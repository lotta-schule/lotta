import React, { memo, useLayoutEffect, useRef } from 'react';
import { WidgetModel, WidgetModelType } from 'model';
import { useIsMobile } from 'util/useIsMobile';
import { useLocalStorage } from 'util/useLocalStorage';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Tabs, Tab, Theme } from '@material-ui/core';
import { Widget } from 'component/widgets/Widget';
import { Widget as WidgetUtil } from 'util/model';
import { useCategoriesAncestorsForItem } from 'util/categories/useCategoriesAncestorsForItem';
import { useCurrentCategoryId } from 'util/path/useCurrentCategoryId';
import { useScrollEvent } from 'util/useScrollEvent';
import { WidgetIcon } from 'component/widgets/WidgetIcon';
import { CurrentUserAvatar } from 'component/user/UserAvatar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import SwipeableViews from 'react-swipeable-views';

export interface WidgetsListProps {
    widgets: WidgetModel[];
    children?: JSX.Element;
}

const useStyles = makeStyles<Theme, { isSecondNavigationOpen: boolean }>(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'stretch',
        [theme.breakpoints.up('md')]: {
            position: 'sticky',
            top: ({ isSecondNavigationOpen }) => isSecondNavigationOpen ? 112 : 72
        }
    },
    tabsRoot: {
        backgroundColor: theme.palette.background.paper,
    },
    tabsScrollButtons: {
        width: 20,
        color: theme.palette.primary.contrastText
    },
    tabsFlexContainer: {
        justifyContent: 'center'
    },
    tabsIndicator: {
        display: 'none'
    },
    tabRoot: {
        lineHeight: 1,
        textTransform: 'initial',
        minWidth: 60,
        filter: 'grayscale(.95) opacity(0.8)'
    },
    tabSelected: {
        filter: 'none'
    },
    swipeableViewsContainer: {
        flexGrow: 1,
        flexShrink: 1,
        height: '100%',
        '& > div': {
            height: '100%'
        }
    }
}));

export const WidgetsList = memo<WidgetsListProps>(({ widgets, children }) => {
    const isMobile = useIsMobile();
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const currentUser = useCurrentUser();
    const currentCategoryId = useCurrentCategoryId();
    const isSecondNavigationOpen = useCategoriesAncestorsForItem(currentCategoryId || '0').length > 0;

    const styles = useStyles({ isSecondNavigationOpen });
    const theme = useTheme();

    const shownWidgets = isMobile ? [WidgetUtil.getProfileWidget(), ...widgets] : widgets;

    useLayoutEffect(() => {
        if (wrapperRef.current) {
            wrapperRef.current.style.height = `calc(100vh - ${wrapperRef.current.getBoundingClientRect().top}px)`;
        }
    }, []);

    useScrollEvent(() => {
        if (wrapperRef.current && !isMobile && widgets.length > 0) {
            wrapperRef.current.style.height = `calc(100vh - ${wrapperRef.current.getBoundingClientRect().top}px)`;
        }
    }, 200, [wrapperRef.current, isMobile, widgets.length]);

    const [currentTabIndex, setCurrentTabIndex] = useLocalStorage('widgetlist-last-selected-item-index', 0);

    const activeTabIndex = currentTabIndex < shownWidgets.length ? currentTabIndex : 0;

    const swipeableViews = (
        <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={activeTabIndex}
            onChangeIndex={newIndex => setCurrentTabIndex(newIndex)}
            className={styles.swipeableViewsContainer}
        >
            {shownWidgets.map(widget => (
                <Widget key={widget.id} widget={widget} />
            ))}
        </SwipeableViews>
    );

    return (
        <div className={styles.root} data-testid={'WidgetsList'} ref={wrapperRef}>
            {shownWidgets && shownWidgets.length > 1 && (
                <>
                    <Tabs
                        value={activeTabIndex}
                        variant={isMobile ? 'fullWidth' : 'scrollable'}
                        scrollButtons="auto"
                        aria-label={'Marginales Modul wählen'}
                        onChange={(_event, newTabIndex) => setCurrentTabIndex(newTabIndex)}
                        classes={{
                            root: styles.tabsRoot,
                            flexContainer: styles.tabsFlexContainer,
                            scrollButtons: styles.tabsScrollButtons,
                            indicator: styles.tabsIndicator
                        }}
                    >
                        {shownWidgets.map((widget, i) => (
                            <Tab
                                key={widget.id}
                                title={widget.title}
                                value={i}
                                icon={
                                    widget.type === WidgetModelType.UserNavigationMobile && currentUser ?
                                        <CurrentUserAvatar style={{ width: 36, height: 36 }} /> :
                                        <WidgetIcon icon={widget.configuration.icon} size={36} />
                                }
                                classes={{
                                    root: styles.tabRoot,
                                    wrapper: styles.tabWrapper,
                                    selected: styles.tabSelected
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

});
