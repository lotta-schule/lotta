import React, { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, ExpansionPanel, ExpansionPanelSummary } from '@material-ui/core';
import { WidgetModel } from 'model';

const useStyles = makeStyles((theme: Theme) => {
    return ({
        heading: {
            marginBottom: theme.spacing(3),
        },
        expansionSummary: {
            backgroundColor: theme.palette.divider
        }
    });
});

export interface WidgetNavigationProps {
    widgets: WidgetModel[];
    selectedWidget: WidgetModel | null;
    onSelectWidget(categoryModel: WidgetModel): void;
}

export const WidgetNavigation = memo<WidgetNavigationProps>(({ widgets, selectedWidget, onSelectWidget }) => {
    const styles = useStyles();

    return (
        <>
            <Typography variant="h5" className={styles.heading}>
                Kategorienübersicht
            </Typography>
            <div style={{ paddingBottom: '5em' }}>
                {widgets.map(widget => (
                    <ExpansionPanel key={widget.id} expanded={false}>
                        <ExpansionPanelSummary
                            aria-controls={`${widget.id}-content`}
                            id={`${widget.id}-header`}
                            className={styles.expansionSummary}
                            onClick={() => onSelectWidget(widget)}
                        >
                            <Typography variant="body1">
                                <b>{widget.title}</b>
                            </Typography>
                        </ExpansionPanelSummary>
                    </ExpansionPanel>
                ))}
            </div>
        </>
    );
});