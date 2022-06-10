import * as React from 'react';
import { Add as AddCircleIcon } from '@material-ui/icons';
import { useQuery, useMutation } from '@apollo/client';
import { Menu, MenuItem, MenuList } from 'shared/general/menu';
import { LinearProgress } from 'shared/general/progress/LinearProgress';
import { WidgetModel, WidgetModelType } from 'model';
import { Widget } from 'util/model';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { WidgetNavigation } from './widgets/WidgetNavigation';
import { WidgetEditor } from './widgets/WidgetEditor';
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
        return <LinearProgress />;
    }

    if (error) {
        return <ErrorMessage error={error} />;
    }

    return (
        <div className={styles.root}>
            <h3 className={styles.headline}>
                Marginalen
                <>
                    <Menu
                        buttonProps={{
                            className: styles.addButton,
                            disabled: isLoadingCreateWidget,
                            icon: (
                                <AddCircleIcon
                                    className={clsx(
                                        styles.leftIcon,
                                        styles.iconSmall
                                    )}
                                />
                            ),
                            label: 'Marginale erstellen',
                        }}
                    >
                        <MenuList>
                            <MenuItem
                                onClick={() => {
                                    onClickCreateWidget(
                                        'Kalender',
                                        WidgetModelType.Calendar
                                    );
                                }}
                                leftSection={Widget.getIconForType(
                                    WidgetModelType.Calendar
                                )}
                            >
                                Kalender-Marginale erstellen
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    onClickCreateWidget(
                                        'VPlan',
                                        WidgetModelType.Schedule
                                    );
                                }}
                                leftSection={Widget.getIconForType(
                                    WidgetModelType.Schedule
                                )}
                            >
                                VPlan-Marginale erstellen
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    onClickCreateWidget(
                                        'IFrame',
                                        WidgetModelType.IFrame
                                    );
                                }}
                                leftSection={Widget.getIconForType(
                                    WidgetModelType.IFrame
                                )}
                            >
                                IFrame-Marginale erstellen
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </>
            </h3>
            <ErrorMessage error={errorCreateWidget} />
            <div className={styles.wrapper}>
                <aside>
                    <WidgetNavigation
                        widgets={data!.widgets}
                        selectedWidget={selectedWidget}
                        onSelectWidget={setSelectedWidget}
                    />
                </aside>
                <div>
                    {selectedWidget && (
                        <WidgetEditor
                            selectedWidget={selectedWidget}
                            onSelectWidget={setSelectedWidget}
                        />
                    )}
                </div>
            </div>
        </div>
    );
});
WidgetList.displayName = 'AdministrationWidgetList';
