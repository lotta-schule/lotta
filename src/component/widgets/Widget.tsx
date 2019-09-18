import React, { memo } from 'react';
import { WidgetModel, WidgetModelType } from 'model';
import { makeStyles, Paper, Typography } from '@material-ui/core';
import { Calendar } from './calendar/Calendar';
import { UserNavigation } from 'component/layouts/navigation/UserNavigation';

export interface WidgetProps {
    widget: WidgetModel;
}

const useStyles = makeStyles(theme => ({
    root: {
        borderRadius: 0,
        marginTop: '0.5em',
        padding: '0.5em'
    },
    heading: {
        marginTop: theme.spacing(1),
        letterSpacing: 2
    }
}));

export const Widget = memo<WidgetProps>(({ widget }) => {
    const styles = useStyles();
    if (widget.type === WidgetModelType.UserNavigation) {
        return <UserNavigation />;
    }
    return (
        <Paper className={styles.root}>
            <Typography variant={'body1'} className={styles.heading}>
                {widget.title}
            </Typography>
            {widget.type === WidgetModelType.Calendar && (
                <Calendar widget={widget} />
            )}
        </Paper>
    )
});