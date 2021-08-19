import * as React from 'react';
import { Divider, Typography, makeStyles } from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { Input } from 'component/general/form/input/Input';
import { Label } from 'component/general/label/Label';
import { WidgetModel, WidgetModelType } from 'model';
import { GroupSelect } from 'component/edit/GroupSelect';
import { useMutation } from '@apollo/client';
import { ID } from 'model/ID';
import { CalendarWidgetConfiguration } from './configuration/CalendarWidgetConfiguration';
import { UpdateWidgetMutation } from 'api/mutation/UpdateWidgetMutation';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ScheduleWidgetConfiguration } from './configuration/ScheduleWidgetConfiguration';
import { DeleteWidgetDialog } from './DeleteWidgetDialog';
import { WidgetIconSelection } from './WidgetIconSelection';

const useStyles = makeStyles((theme) => ({
    input: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        width: '100%',
    },
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    divider: {
        clear: 'both',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
}));

export interface WidgetEditorProps {
    selectedWidget: WidgetModel | null;
    onSelectWidget(widget: WidgetModel | null): void;
}

export const WidgetEditor = React.memo<WidgetEditorProps>(
    ({ selectedWidget, onSelectWidget }) => {
        const styles = useStyles();

        const [widget, setWidget] = React.useState<WidgetModel | null>(null);
        const [
            isDeleteWidgetDialogOpen,
            setIsDeleteWidgetDialogOpen,
        ] = React.useState(false);

        const [mutateWidget, { loading: isLoading, error }] = useMutation<
            { widget: WidgetModel },
            { id: ID; widget: any }
        >(UpdateWidgetMutation);

        const updateWidget = React.useCallback(async () => {
            if (!selectedWidget || !widget) {
                return null;
            }
            mutateWidget({
                variables: {
                    id: selectedWidget.id,
                    widget: {
                        title: widget.title,
                        groups: widget.groups?.map(({ id }) => ({ id })),
                        iconImageFile: widget.iconImageFile && {
                            id: widget.iconImageFile.id,
                        },
                        configuration: JSON.stringify(widget.configuration),
                    },
                },
            });
        }, [selectedWidget, widget, mutateWidget]);

        React.useEffect(() => {
            if (selectedWidget === null && widget !== null) {
                setWidget(null);
            } else if (selectedWidget) {
                if (!widget || widget.id !== selectedWidget.id) {
                    setWidget({ ...selectedWidget });
                }
            }
        }, [widget, selectedWidget]);

        if (!widget) {
            return null;
        }

        return (
            <>
                <Typography variant="h5">
                    {selectedWidget
                        ? selectedWidget.title
                        : widget && widget.title}
                </Typography>
                <Typography color={'textSecondary'} variant={'subtitle2'}>
                    {widget.type}
                </Typography>
                <ErrorMessage error={error} />
                <Label label="Name des Widget">
                    <Input
                        className={styles.input}
                        value={widget.title}
                        onChange={(e) =>
                            setWidget({
                                ...widget,
                                title: e.currentTarget.value,
                            })
                        }
                    />
                </Label>

                <Divider className={styles.divider} />

                <WidgetIconSelection
                    icon={widget.configuration?.icon ?? {}}
                    onSelectIcon={(icon) =>
                        setWidget({
                            ...widget,
                            configuration: { ...widget.configuration, icon },
                        })
                    }
                />

                <Divider className={styles.divider} />

                <GroupSelect
                    className={styles.input}
                    selectedGroups={widget.groups || []}
                    disableAdminGroupsExclusivity
                    onSelectGroups={(groups) =>
                        setWidget({ ...widget, groups })
                    }
                />

                {widget.type === WidgetModelType.Calendar && (
                    <CalendarWidgetConfiguration
                        configuration={widget.configuration || {}}
                        setConfiguration={(configuration) =>
                            setWidget({ ...widget, configuration })
                        }
                    />
                )}
                {widget.type === WidgetModelType.Schedule && (
                    <ScheduleWidgetConfiguration
                        configuration={widget.configuration || {}}
                        setConfiguration={(configuration) =>
                            setWidget({ ...widget, configuration })
                        }
                    />
                )}

                <Button
                    style={{ float: 'right' }}
                    disabled={isLoading}
                    className={styles.button}
                    onClick={() => updateWidget()}
                >
                    Marginale speichern
                </Button>
                <Divider className={styles.divider} />
                <Button
                    variant={'error'}
                    className={styles.button}
                    onClick={() => setIsDeleteWidgetDialogOpen(true)}
                >
                    Marginale löschen
                </Button>
                <DeleteWidgetDialog
                    isOpen={isDeleteWidgetDialogOpen}
                    widget={widget}
                    onClose={() => setIsDeleteWidgetDialogOpen(false)}
                    onConfirm={() => {
                        setIsDeleteWidgetDialogOpen(false);
                        onSelectWidget(null);
                    }}
                />
            </>
        );
    }
);
