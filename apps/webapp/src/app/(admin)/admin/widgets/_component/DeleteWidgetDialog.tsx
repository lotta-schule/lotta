import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import { WidgetModel, ID } from 'model';
import {
  Button,
  LoadingButton,
  Dialog,
  DialogActions,
  DialogContent,
  ErrorMessage,
} from '@lotta-schule/hubert';

import DeleteWidgetMutation from 'api/mutation/DeleteWidgetMutation.graphql';
import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';

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
      variables: { id: widget.id },
      update: (cache, { data }) => {
        if (data?.widget) {
          const normalizedId = cache.identify(data.widget);
          if (normalizedId) {
            cache.evict({ id: normalizedId });
          }
        }
      },
      refetchQueries: [{ query: GetCategoriesQuery }],
    });

    return (
      <Dialog
        open={isOpen}
        onRequestClose={onRequestClose}
        title={'Marginale löschen'}
      >
        <DialogContent>
          <ErrorMessage error={error} />
          <p>
            Möchtest du die Marginale "{widget.title}" wirklich löschen? Sie ist
            dann unwiederbringlich verloren.
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={(_e: React.MouseEvent) => onRequestClose()}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <LoadingButton
            onAction={async () => {
              await deleteWidget();
            }}
            onComplete={onConfirm}
          >
            Marginale endgültig löschen
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  }
);
DeleteWidgetDialog.displayName = 'DeleteWidgetDialog';
