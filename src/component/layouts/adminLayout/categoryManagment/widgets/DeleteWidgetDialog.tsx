import React, { memo } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogContentText,
    Button,
    DialogActions,
} from '@material-ui/core';
import { WidgetModel, ID } from 'model';
import { useMutation } from '@apollo/client';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';
import { GetWidgetsQuery } from 'api/query/GetWidgetsQuery';
import { DeleteWidgetMutation } from 'api/mutation/DeleteWidgetMutation';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';
import { ErrorMessage } from 'component/general/ErrorMessage';

export interface DeleteWidgetDialogProps {
    isOpen: boolean;
    widget: WidgetModel;
    onClose(
        event: {},
        reason: 'backdropClick' | 'escapeKeyDown' | 'auto'
    ): void;
    onConfirm(): void;
}

export const DeleteWidgetDialog = memo<DeleteWidgetDialogProps>(
    ({ isOpen, widget, onClose, onConfirm }) => {
        const [deleteWidget, { loading: isLoading, error }] = useMutation<
            { widget: WidgetModel },
            { id: ID }
        >(DeleteWidgetMutation, {
            update: (cache, { data }) => {
                if (data && data.widget) {
                    const readWdgetsResult = cache.readQuery<{
                        widgets: WidgetModel[];
                    }>({ query: GetWidgetsQuery });
                    cache.writeQuery<{ widgets: WidgetModel[] }>({
                        query: GetWidgetsQuery,
                        data: {
                            widgets: readWdgetsResult!.widgets.filter(
                                (w) => w.id !== data.widget.id
                            ),
                        },
                    });
                }
            },
            refetchQueries: [{ query: GetCategoriesQuery }],
            onCompleted: () => {
                onConfirm();
            },
        });

        return (
            <ResponsiveFullScreenDialog
                open={isOpen}
                onClose={onClose}
                aria-labelledby="delete-user-widget-dialog"
            >
                <DialogTitle id="delete-user-widget-dialog-title">
                    Gruppe löschen
                </DialogTitle>
                <DialogContent>
                    <ErrorMessage error={error} />
                    <DialogContentText>
                        Möchtest du die Marginale "{widget.title}" wirklich
                        löschen? Sie ist dann unwiederbringlich verloren.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color={'primary'}
                        onClick={(e) => onClose(e, 'auto')}
                        disabled={isLoading}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        color={'secondary'}
                        onClick={() =>
                            deleteWidget({ variables: { id: widget.id } })
                        }
                        disabled={isLoading}
                    >
                        Marginale endgültig löschen
                    </Button>
                </DialogActions>
            </ResponsiveFullScreenDialog>
        );
    }
);
