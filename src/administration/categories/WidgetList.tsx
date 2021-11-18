import * as React from 'react';
import { Grid, CircularProgress, Menu, MenuItem } from '@material-ui/core';
import { Add as AddCircleIcon } from '@material-ui/icons';
import { useQuery, useMutation } from '@apollo/client';
import { Button } from 'shared/general/button/Button';
import { WidgetModel, WidgetModelType } from 'model';
import { Widget } from 'util/model';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { WidgetNavigation } from './widgets/WidgetNavigation';
import { WidgetEditor } from './widgets/WidgetEditor';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import clsx from 'clsx';

import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';
import CreateWidgetMutation from 'api/mutation/CreateWidgetMutation.graphql';

import styles from './WidgetList.module.scss';

export const WidgetList = React.memo(() => {
    const [selectedWidget, setSelectedWidget] =
        React.useState<WidgetModel | null>(null);

    const {
        data,
        loading: isLoading,
        error,
    } = useQuery<{
        widgets: WidgetModel[];
    }>(GetWidgetsQuery);
    const [
        createWidget,
        { loading: isLoadingCreateWidget, error: errorCreateWidget },
    ] = useMutation<
        { widget: WidgetModel },
        { title: string; type: WidgetModelType }
    >(CreateWidgetMutation, {
        onCompleted: ({ widget }) => {
            setSelectedWidget(widget);
        },
    });

    const onClickCreateWidget = (title: string, type: WidgetModelType) => {
        createWidget({
            variables: {
                title,
                type,
            },
            update: (cache, { data }) => {
                const { widgets } = cache.readQuery<{ widgets: WidgetModel[] }>(
                    { query: GetWidgetsQuery }
                ) || { widgets: [] };
                cache.writeQuery({
                    query: GetWidgetsQuery,
                    data: { widgets: widgets.concat([data!.widget]) },
                });
            },
        });
    };

    if (isLoading) {
        return <CircularProgress />;
    }

    if (error) {
        return <ErrorMessage error={error} />;
    }

    return (
        <div className={styles.root}>
            <h3 className={styles.headline}>
                Marginalen
                <PopupState
                    variant={'popover'}
                    popupId={'addWidgetButtonPopup'}
                >
                    {(popupState) => (
                        <>
                            <Button
                                className={styles.addButton}
                                disabled={isLoadingCreateWidget}
                                icon={
                                    <AddCircleIcon
                                        className={clsx(
                                            styles.leftIcon,
                                            styles.iconSmall
                                        )}
                                    />
                                }
                                {...bindTrigger(popupState)}
                            >
                                Marginale erstellen
                            </Button>
                            <Menu {...bindMenu(popupState)}>
                                <MenuItem
                                    onClick={() => {
                                        onClickCreateWidget(
                                            'Kalender',
                                            WidgetModelType.Calendar
                                        );
                                        popupState.close();
                                    }}
                                >
                                    {Widget.getIconForType(
                                        WidgetModelType.Calendar
                                    )}{' '}
                                    &nbsp; Kalender-Marginale erstellen
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        onClickCreateWidget(
                                            'VPlan',
                                            WidgetModelType.Schedule
                                        );
                                        popupState.close();
                                    }}
                                >
                                    {Widget.getIconForType(
                                        WidgetModelType.Schedule
                                    )}{' '}
                                    &nbsp; VPlan-Marginale erstellen
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        onClickCreateWidget(
                                            'IFrame',
                                            WidgetModelType.IFrame
                                        );
                                        popupState.close();
                                    }}
                                >
                                    {Widget.getIconForType(
                                        WidgetModelType.IFrame
                                    )}{' '}
                                    &nbsp; IFrame-Marginale erstellen
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </PopupState>
            </h3>
            <ErrorMessage error={errorCreateWidget} />
            <Grid container>
                <Grid item xs={12} sm={5} className={styles.navigationWrapper}>
                    <WidgetNavigation
                        widgets={data!.widgets}
                        selectedWidget={selectedWidget}
                        onSelectWidget={setSelectedWidget}
                    />
                </Grid>
                <Grid item xs={12} sm={7}>
                    {selectedWidget && (
                        <WidgetEditor
                            selectedWidget={selectedWidget}
                            onSelectWidget={setSelectedWidget}
                        />
                    )}
                </Grid>
            </Grid>
        </div>
    );
});
