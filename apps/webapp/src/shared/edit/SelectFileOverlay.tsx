import * as React from 'react';
import { FileModel } from 'model';
import { Button, Dialog, DialogActions } from '@lotta-schule/hubert';
import { UserBrowser } from 'shared/browser';
import { EditOverlay } from './EditOverlay';

export type SelectFileOverlayProps = {
  label: string;
  description?: string;
  allowDeletion?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode | Iterable<React.ReactNode>;
  fileFilter?(file: FileModel): boolean;
  onSelectFile(file: FileModel | null): void;
};

export const SelectFileOverlay = ({
  children,
  label,
  description,
  allowDeletion,
  fileFilter,
  style,
  onSelectFile,
}: SelectFileOverlayProps) => {
  const [selectedFile, setSelectedFile] = React.useState<FileModel | null>(
    null
  );
  const [isSelectFileDialogOpen, setIsSelectFileDialogOpen] =
    React.useState(false);
  const onClickRemove = React.useMemo(
    () => (allowDeletion ? () => onSelectFile(null) : undefined),
    [allowDeletion, onSelectFile]
  );

  React.useEffect(() => {
    if (!isSelectFileDialogOpen) {
      setSelectedFile(null);
    }
  }, [isSelectFileDialogOpen]);

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
          onSelect={(files) => setSelectedFile(files.at(-1) ?? null)}
        />
        <DialogActions>
          <Button onClick={() => setIsSelectFileDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button
            disabled={!selectedFile}
            onClick={() => {
              setIsSelectFileDialogOpen(false);
              onSelectFile(selectedFile);
            }}
          >
            Datei auswählen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
SelectFileOverlay.displayName = 'SelectFileOverlay';
