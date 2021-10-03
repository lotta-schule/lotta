import * as React from 'react';
import { Grid, CircularProgress, Menu, MenuItem } from '@material-ui/core';
import { Add as AddCircleIcon, Slideshow } from '@material-ui/icons';
import { useQuery, useMutation } from '@apollo/client';
import { AdminLayout } from 'component/layouts/adminLayout/AdminLayout';
import { Button } from 'component/general/button/Button';
import { WidgetModel, WidgetModelType } from 'model';
import { Widget } from 'util/model';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { WidgetEditor } from 'component/layouts/adminLayout/categoryManagment/widgets/WidgetEditor';
import { WidgetNavigation } from 'component/layouts/adminLayout/categoryManagment/widgets/WidgetNavigation';
import { GetServerSidePropsContext } from 'next';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';
import CreateWidgetMutation from 'api/mutation/CreateWidgetMutation.graphql';
import clsx from 'clsx';

import styles from './widgets.module.scss';

export const Widgets = () => {
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
        <AdminLayout
            title={
                <>
                    <Slideshow /> Marginalen
                </>
            }
            hasHomeLink
        >
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
        </AdminLayout>
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default Widgets;
