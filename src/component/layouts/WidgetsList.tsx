import React, { memo, useLayoutEffect, useState, useRef } from 'react';
import { WidgetModel } from 'model';
import { useIsMobile } from 'util/useIsMobile';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Tabs, Tab } from '@material-ui/core';
import { Widget } from 'component/widgets/Widget';
import { Widget as WidgetUtil } from 'util/model';
import SwipeableViews from 'react-swipeable-views';

export interface WidgetsListProps {
    widgets: WidgetModel[];
}

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'stretch',
        [theme.breakpoints.up('sm')]: {
            position: 'sticky',
            top: 70
        }
    },
    tabs: {
        backgroundColor: theme.palette.primary.main
    },
    tabRoot: {
        lineHeight: 1,
        textTransform: 'initial'
    },
    tabWrapper: {
        '& img': {
            filter: 'grayscale(1)'
        }
    },
    tabSelected: {
        '& img': {
            filter: 'none'
        }
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

export const WidgetsList = memo<WidgetsListProps>(({ widgets }) => {
    const styles = useStyles();
    const theme = useTheme();

    const isMobile = useIsMobile();

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const [currentTabIndex, setCurrentTabIndex] = useState(0);

    useLayoutEffect(() => {
        if (wrapperRef.current) {
            wrapperRef.current.style.height = `calc(100vh - ${wrapperRef.current.offsetTop}px)`;
        }
    }, []);

    const shownWidgets = isMobile ? [WidgetUtil.getProfileWidget(), ...widgets] : widgets;

    const swipeableViews = (
        <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={currentTabIndex}
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
            {!isMobile && (
                <Widget widget={WidgetUtil.getProfileWidget()} />
            )}
            {shownWidgets && shownWidgets.length > 1 && (
                <>
                    <Tabs
                        className={styles.tabs}
                        value={currentTabIndex}
                        indicatorColor={'secondary'}
                        textColor={'secondary'}
                        variant={isMobile ? 'fullWidth' : 'standard'}
                        aria-label={'Marginales Modul wählen'}
                        onChange={(_event, newTabIndex) => setCurrentTabIndex(newTabIndex)}
                    >
                        {shownWidgets.map((widget, i) => (
                            <Tab
                                key={widget.id}
                                title={widget.title}
                                value={i}
                                icon={WidgetUtil.getIcon(widget)}
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
        </div>
    );

});