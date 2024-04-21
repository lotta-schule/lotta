import * as React from 'react';
import { FileModel } from 'model';
import { Dialog } from '@lotta-schule/hubert';
import { UserBrowser } from 'shared/browser';
import { EditOverlay } from './EditOverlay';

interface SelectFileOverlayProps {
  label: string;
  description?: string;
  allowDeletion?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode | Iterable<React.ReactNode>;
  fileFilter?(file: FileModel): boolean;
  onSelectFile(file: FileModel | null): void;
}

export const SelectFileOverlay: React.FunctionComponent<SelectFileOverlayProps> =
  React.memo(
    ({
      children,
      label,
      description,
      allowDeletion,
      fileFilter,
      style,
      onSelectFile,
    }) => {
      const [isSelectFileDialogOpen, setIsSelectFileDialogOpen] =
        React.useState(false);
      const onClickRemove = allowDeletion
        ? () => onSelectFile(null)
        : undefined;
      return (
        <>
          <EditOverlay
            style={style}
            label={label}
            description={description}
            onClick={() => setIsSelectFileDialogOpen(true)}
            onClickRemove={onClickRemove}
          >
            {children}
          </EditOverlay>
          <Dialog
            wide
            open={isSelectFileDialogOpen}
            onRequestClose={() => setIsSelectFileDialogOpen(false)}
            title={'Datei auswählen'}
          >
            <UserBrowser
              isNodeDisabled={(node) =>
                node.type === 'file' &&
                fileFilter?.(node.meta as FileModel) === false
              }
              onSelect={([file]) => {
                setIsSelectFileDialogOpen(false);
                onSelectFile(file);
              }}
            />
          </Dialog>
        </>
      );
    }
  );
SelectFileOverlay.displayName = 'SelectFileOverlay';
