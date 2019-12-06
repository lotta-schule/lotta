import React, { memo, useState, useEffect, useCallback } from 'react';
import { Typography, makeStyles, Theme, TextField, Button } from '@material-ui/core';
import { WidgetModel, WidgetModelType } from 'model';
import { GroupSelect } from 'component/edit/GroupSelect';
import { useMutation } from 'react-apollo';
import { ID } from 'model/ID';
import { CalendarWidgetConfiguration } from './configuration/CalendarWidgetConfiguration';
import { UpdateWidgetMutation } from 'api/mutation/UpdateWidgetMutation';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { ScheduleWidgetConfiguration } from './configuration/ScheduleWidgetConfiguration';
import Img from 'react-cloudimage-responsive';

const useStyles = makeStyles((theme: Theme) => ({
    input: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        width: '100%'
    },
    switchBase: {
        color: 'gray'
    }
}));

export interface WidgetEditorProps {
    selectedWidget: WidgetModel | null;
}


export const WidgetEditor = memo<WidgetEditorProps>(({ selectedWidget }) => {

    const styles = useStyles();

    const [widget, setWidget] = useState<WidgetModel | null>(null);

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

            <SelectFileOverlay label={'Icon ändern'} onSelectFile={iconImageFile => setWidget({ ...widget, iconImageFile })}>
                {widget.iconImageFile ? (
                    <Img operation={'cover'} size={'100x100'} src={widget.iconImageFile.remoteLocation} />
                ) : (<PlaceholderImage width={'100%'} height={100} />)}
            </SelectFileOverlay>

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

            <p>&nbsp;</p>
            <Button
                style={{ float: 'right' }}
                disabled={isLoading}
                variant={'contained'}
                color={'secondary'}
                onClick={() => updateWidget()}
            >
                Widget speichern
            </Button>
        </>
    );

});