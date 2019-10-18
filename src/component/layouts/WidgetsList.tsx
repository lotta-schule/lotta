import React, { memo, useState } from 'react';
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

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'stretch',
        height: '100%',
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
        '& > div': {
            height: '100%'
        }
    }
}));

export const WidgetsList = memo<WidgetsListProps>(({ widgets }) => {
    const styles = useStyles();
    const theme = useTheme();

    const isMobile = useIsMobile();

    const [currentTabIndex, setCurrentTabIndex] = useState(0);

    const shownWidgets = [WidgetUtil.getProfileWidget(), ...widgets];

    if (isMobile) {
        return (
            <div className={styles.root} data-testid={'WidgetsList'}>
                <Tabs
                    value={currentTabIndex}
                    indicatorColor={'secondary'}
                    textColor={'secondary'}
                    variant={'fullWidth'}
                    aria-label={'Marginales Modul wählen'}
                    onChange={(_event, newTabIndex) => setCurrentTabIndex(newTabIndex)}
                >
                    {shownWidgets.map((widget, i) => (
                        <Tab
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
            </div>
        );
    } else {
        return (
            <div className={styles.root} data-testid={'WidgetsList'}>
                {shownWidgets.map(widget => (
                    <Widget key={widget.id} widget={widget} />
                ))}
            </div>
        );
    }

});