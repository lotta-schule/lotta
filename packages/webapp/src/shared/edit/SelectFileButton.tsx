import * as React from 'react';
import { FileModel } from 'model';
import { Button, ButtonProps, Dialog } from '@lotta-schule/hubert';
import { UserBrowser, UserBrowserProps } from 'shared/browser';

interface SelectFileButtonProps<Multiple extends boolean> {
  label: string | JSX.Element;
  buttonComponent?: any;
  buttonComponentProps?: any;
  multiple?: Multiple;
  fileFilter?(file: FileModel): boolean;
  onSelect?(file: Multiple extends true ? FileModel[] : FileModel): void;
  onChangeFileExplorerVisibility?(isFileExplorerVisible: boolean): void;
}

const _SelectFileButton = <Multiple extends boolean | undefined>({
  label,
  fileFilter,
  multiple,
  onSelect,
  buttonComponent,
  buttonComponentProps,
  onChangeFileExplorerVisibility,
}: SelectFileButtonProps<Multiple extends undefined ? false : Multiple>) => {
  const [isSelectFileDialogOpen, setIsSelectFileDialogOpen] =
    React.useState(false);
  const fileExplorerOptions: Partial<UserBrowserProps> = {};

  React.useEffect(() => {
    onChangeFileExplorerVisibility?.(isSelectFileDialogOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelectFileDialogOpen]);

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
      >
        <UserBrowser
          style={{ padding: '0 .5em' }}
          fileFilter={fileFilter}
          mode={multiple ? 'select-multiple' : 'select'}
          onSelect={(result) => {
            setIsSelectFileDialogOpen(false);
            onSelect?.((multiple ? result : result[0]) as any);
          }}
          {...fileExplorerOptions}
        />
      </Dialog>
    </>
  );
};
_SelectFileButton.displayName = 'SelectFileButton';

export const SelectFileButton = React.memo(_SelectFileButton);
