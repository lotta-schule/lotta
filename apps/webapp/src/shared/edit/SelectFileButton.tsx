import * as React from 'react';
import { FileModel } from '#/model';
import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
} from '@lotta-schule/hubert';
import { UserBrowser, UserBrowserProps } from '#/shared/browser';
import { useTranslation } from 'react-i18next';

type SelectFileButtonProps = {
  label: string | React.ReactNode;
  buttonComponent?: any;
  buttonComponentProps?: any;
  fileFilter?: (file: FileModel) => boolean;
  onChangeFileExplorerVisibility?: (isFileExplorerVisible: boolean) => void;
} & (
  | { multiple: true; onSelect?: (files: FileModel[]) => void }
  | { multiple?: false; onSelect?: (file: FileModel) => void }
);

export const UnmemoedSelectFileButton = ({
  label,
  fileFilter,
  multiple,
  onSelect,
  buttonComponent,
  buttonComponentProps,
  onChangeFileExplorerVisibility,
}: SelectFileButtonProps) => {
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = React.useState<FileModel[]>([]);
  const [isSelectFileDialogOpen, setIsSelectFileDialogOpen] =
    React.useState(false);
  const fileExplorerOptions: Partial<UserBrowserProps> = {};
  const lastBrowserVisible = React.useRef(false);

  React.useEffect(() => {
    if (isSelectFileDialogOpen !== lastBrowserVisible.current) {
      onChangeFileExplorerVisibility?.(isSelectFileDialogOpen);
      lastBrowserVisible.current = isSelectFileDialogOpen;
    }

    if (!isSelectFileDialogOpen) {
      setSelectedFiles([]);
    }
  }, [isSelectFileDialogOpen, onChangeFileExplorerVisibility]);

  return (
    <>
      {React.createElement<ButtonProps>(
        buttonComponent || Button,
        {
          onMouseDown: (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            setIsSelectFileDialogOpen(true);
          },
          ...buttonComponentProps,
        },
        label
      )}
      <Dialog
        open={isSelectFileDialogOpen}
        onRequestClose={() => setIsSelectFileDialogOpen(false)}
        title={'Datei auswählen'}
        wide
      >
        <DialogContent>
          <UserBrowser
            isNodeDisabled={(node) =>
              node.type === 'file' &&
              fileFilter?.(node.meta as FileModel) === false
            }
            multiple={multiple}
            onSelect={setSelectedFiles}
            {...fileExplorerOptions}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSelectFileDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button
            disabled={selectedFiles.length === 0}
            onClick={() => {
              setIsSelectFileDialogOpen(false);
              onSelect?.((multiple ? selectedFiles : selectedFiles[0]) as any);
            }}
          >
            {multiple && t('select files', { count: selectedFiles.length })}
            {!multiple && t('select file')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
UnmemoedSelectFileButton.displayName = 'SelectFileButton';

export const SelectFileButton = React.memo(UnmemoedSelectFileButton);
