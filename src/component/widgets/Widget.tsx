import React, { memo } from 'react';
import { WidgetModel, WidgetModelType } from 'model';
import { makeStyles, Paper, Typography } from '@material-ui/core';
import { Calendar } from './calendar/Calendar';
import { Schedule } from './schedule/Schedule';
import { UserNavigationMobile } from 'component/layouts/navigation/UserNavigationMobile';

export interface WidgetProps {
    widget: WidgetModel;
}

const useStyles = makeStyles((theme) => ({
    root: {
        height: `calc(100% - ${theme.spacing(2)}px)`,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        '& > *': {
            boxSizing: 'border-box',
        },
    },
    heading: {
        textAlign: 'center',
    },
}));

export const Widget = memo<WidgetProps>(({ widget }) => {
    const styles = useStyles();
    if (widget.type === WidgetModelType.UserNavigationMobile) {
        return <UserNavigationMobile />;
    }
    return (
        <Paper className={styles.root}>
            <Typography variant={'body1'} className={styles.heading}>
                {widget.title}
            </Typography>
            {widget.type === WidgetModelType.Calendar && (
                <Calendar widget={widget} />
            )}
            {widget.type === WidgetModelType.Schedule && (
                <Schedule widget={widget} />
            )}
        </Paper>
    );
});
