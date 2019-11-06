import React, { FunctionComponent, memo, useState } from 'react';
import {
    Paper, Typography, makeStyles, Theme, Button, Grid, CircularProgress, Menu, MenuItem
} from '@material-ui/core';
import { Add as AddCircleIcon } from '@material-ui/icons';
import classNames from 'classnames';
import { WidgetModel, WidgetModelType } from 'model';
import { WidgetEditor } from './WidgetEditor';
import { WidgetNavigation } from './WidgetNavigation';
import { useQuery, useMutation } from 'react-apollo';
import { GetWidgetsQuery } from 'api/query/GetWidgetsQuery';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import { CreateWidgetMutation } from 'api/mutation/CreateWidgetMutation';
import { Widget } from 'util/model';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    headline: {
        marginBottom: theme.spacing(4),
    },
    addButton: {
        float: 'right',
        marginTop: theme.spacing(1)
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
    navigationWrapper: {
        paddingRight: theme.spacing(4)
    }
}));

export const WidgetManagement: FunctionComponent = memo(() => {
    const styles = useStyles();

    const [selectedWidget, setSelectedWidget] = useState<WidgetModel | null>(null);

    const { data, loading: isLoading, error } = useQuery<{ widgets: WidgetModel[] }>(GetWidgetsQuery);
    const [createWidget, { loading: isLoadingCreateWidget, error: errorCreateWidget }] = useMutation<{ widget: WidgetModel }, { title: string; type: WidgetModelType }>(CreateWidgetMutation);

    const onClickCreateWidget = (title: string, type: WidgetModelType) => {
        createWidget({
            variables: {
                title,
                type
            },
            update: (cache, { data }) => {
                const { widgets } = cache.readQuery<{ widgets: WidgetModel[] }>({ query: GetWidgetsQuery }) || { widgets: [] };
                cache.writeQuery({
                    query: GetWidgetsQuery,
                    data: { widgets: widgets.concat([data!.widget]) }
                });
            }
        })
    };

    if (isLoading) {
        return (
            <CircularProgress />
        );
    }

    if (error) {
        return (
            <div style={{ color: 'red' }}>{error.message}</div>
        );
    }

    return (
        <Paper className={styles.root}>
            <Typography variant={'h4'} className={styles.headline}>
                Widgetverwaltung

                <PopupState variant={'popover'} popupId={'addWidgetButtonPopup'}>{popupState => (
                    <>
                        <Button
                            size={'small'}
                            variant={'contained'}
                            color={'secondary'}
                            className={styles.addButton}
                            disabled={isLoadingCreateWidget}
                            {...bindTrigger(popupState)}
                        >
                            <AddCircleIcon className={classNames(styles.leftIcon, styles.iconSmall)} />
                            Widget hinzufügen
                        </Button>
                        <Menu {...bindMenu(popupState)}>
                            <MenuItem
                                onClick={() => {
                                    onClickCreateWidget('Kalender', WidgetModelType.Calendar);
                                    popupState.close();
                                }}
                            >
                                {Widget.getIconForType(WidgetModelType.Calendar)} &nbsp;
                                Kalender-Widget hinzufügen
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    onClickCreateWidget('VPlan', WidgetModelType.Schedule);
                                    popupState.close();
                                }}
                            >
                                {Widget.getIconForType(WidgetModelType.Schedule)} &nbsp;
                                VPlan-Widget hinzufügen
                            </MenuItem>
                        </Menu>
                    </>
                )}</PopupState>
            </Typography>

            {errorCreateWidget && <div style={{ color: 'red' }}>{errorCreateWidget.message}</div>}

            <Grid container>
                <Grid item sm={5} className={styles.navigationWrapper} >
                    <WidgetNavigation widgets={data!.widgets} selectedWidget={selectedWidget} onSelectWidget={setSelectedWidget} />
                </Grid>
                <Grid item sm={7}>
                    {selectedWidget && (
                        <WidgetEditor selectedWidget={selectedWidget} />
                    )}
                </Grid>
            </Grid>
        </Paper >
    );
});