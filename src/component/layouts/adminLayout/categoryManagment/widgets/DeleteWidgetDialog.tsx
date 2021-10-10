import * as React from 'react';
import { useMutation } from '@apollo/client';
import { WidgetModel, ID } from 'model';
import { Button } from 'component/general/button/Button';
import {
    Dialog,
    DialogActions,
    DialogContent,
} from 'component/general/dialog/Dialog';
import { ErrorMessage } from 'component/general/ErrorMessage';

import DeleteWidgetMutation from 'api/mutation/DeleteWidgetMutation.graphql';
import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';

export interface DeleteWidgetDialogProps {
    isOpen: boolean;
    widget: WidgetModel;
    onRequestClose(): void;
    onConfirm(): void;
}

export const DeleteWidgetDialog = React.memo<DeleteWidgetDialogProps>(
    ({ isOpen, widget, onRequestClose, onConfirm }) => {
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
            <Dialog
                open={isOpen}
                onRequestClose={onRequestClose}
                title={'Gruppe löschen'}
            >
                <DialogContent>
                    <ErrorMessage error={error} />
                    <p>
                        Möchtest du die Marginale "{widget.title}" wirklich
                        löschen? Sie ist dann unwiederbringlich verloren.
                    </p>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={(e: React.MouseEvent) => onRequestClose()}
                        disabled={isLoading}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={() =>
                            deleteWidget({ variables: { id: widget.id } })
                        }
                        disabled={isLoading}
                    >
                        Marginale endgültig löschen
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
);
