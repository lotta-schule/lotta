import React, { memo, useState, useEffect, useCallback } from 'react';
import { Button, Divider, TextField, Typography, makeStyles } from '@material-ui/core';
import { WidgetModel, WidgetModelType } from 'model';
import { GroupSelect } from 'component/edit/GroupSelect';
import { useMutation } from 'react-apollo';
import { ID } from 'model/ID';
import { CalendarWidgetConfiguration } from './configuration/CalendarWidgetConfiguration';
import { UpdateWidgetMutation } from 'api/mutation/UpdateWidgetMutation';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ScheduleWidgetConfiguration } from './configuration/ScheduleWidgetConfiguration';
import { DeleteWidgetDialog } from './DeleteWidgetDialog';
import clsx from 'clsx';
import { WidgetIconSelection } from './WidgetIconSelection';

const useStyles = makeStyles(theme => ({
    input: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        width: '100%'
    },
    switchBase: {
        color: 'gray'
    },
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    divider: {
        clear: 'both',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    deleteButton: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText
    }
}));

export interface WidgetEditorProps {
    selectedWidget: WidgetModel | null;
    onSelectWidget(widget: WidgetModel | null): void;
}


export const WidgetEditor = memo<WidgetEditorProps>(({ selectedWidget, onSelectWidget }) => {

    const styles = useStyles();

    const [widget, setWidget] = useState<WidgetModel | null>(null);
    const [isDeleteWidgetDialogOpen, setIsDeleteWidgetDialogOpen] = useState(false);

    const [mutateWidget, { loading: isLoading, error }] = useMutation<{ widget: WidgetModel }, { id: ID, widget: Partial<WidgetModel> }>(UpdateWidgetMutation);

    const updateWidget = useCallback(async () => {
        if (!selectedWidget || !widget) {
            return null;
        }
        mutateWidget({
            variables: {
                id: selectedWidget.id,
                widget: {
                    title: widget.title,
                    groups: widget.groups,
                    iconImageFile: widget.iconImageFile,
                    configuration: JSON.stringify(widget.configuration)
                }
            }
        });
    }, [selectedWidget, widget, mutateWidget]);

    useEffect(() => {
        if (selectedWidget === null && widget !== null) {
            setWidget(null);
        } else if (selectedWidget) {
            if (!widget || widget.id !== selectedWidget.id) {
                setWidget({ ...selectedWidget });
            }
        }
    }, [widget, selectedWidget])

    if (!widget) {
        return null;
    }

    return (
        <>
            <Typography variant="h5">
                {selectedWidget ? selectedWidget.title : widget && widget.title}
            </Typography>
            <Typography color={'textSecondary'} variant={'subtitle2'}>
                {widget.type}
            </Typography>
            <ErrorMessage error={error} />
            <TextField
                className={styles.input}
                fullWidth
                label="Name des Widget"
                value={widget.title}
                onChange={e => setWidget({ ...widget, title: e.target.value })}
            />

            <Divider className={styles.divider} />

            <WidgetIconSelection icon={widget.configuration.icon ?? {}} onSelectIcon={icon => setWidget({ ...widget, configuration: { ...widget.configuration, icon } })} />

            <Divider className={styles.divider} />

            <GroupSelect
                className={styles.input}
                selectedGroups={widget.groups || []}
                disableAdminGroupsExclusivity
                onSelectGroups={groups => setWidget({ ...widget, groups })}
            />

            {widget.type === WidgetModelType.Calendar &&
                <CalendarWidgetConfiguration
                    configuration={widget.configuration || {}}
                    setConfiguration={configuration => setWidget({ ...widget, configuration })} />}
            {widget.type === WidgetModelType.Schedule &&
                <ScheduleWidgetConfiguration
                    configuration={widget.configuration || {}}
                    setConfiguration={configuration => setWidget({ ...widget, configuration })} />}

            <Button
                style={{ float: 'right' }}
                disabled={isLoading}
                variant={'contained'}
                color={'secondary'}
                className={styles.button}
                onClick={() => updateWidget()}
            >
                Marginale speichern
            </Button>
            <Divider className={styles.divider} />
            <Button
                variant={'contained'}
                className={clsx(styles.button, styles.deleteButton)}
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

});