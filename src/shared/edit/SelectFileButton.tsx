import * as React from 'react';
import { FileModel } from 'model';
import { Button, ButtonProps, Dialog } from '@lotta-schule/hubert';
import {
    FileExplorer,
    FileExplorerProps,
} from 'shared/fileExplorer/FileExplorer';

interface SelectFileButtonProps {
    label: string | JSX.Element;
    buttonComponent?: any;
    buttonComponentProps?: any;
    multiple?: boolean;
    fileFilter?(file: FileModel): boolean;
    onSelect?(file: FileModel | FileModel[]): void;
    onChangeFileExplorerVisibility?(isFileExplorerVisible: boolean): void;
}

export const SelectFileButton = React.memo<SelectFileButtonProps>(
    ({
        label,
        fileFilter,
        multiple,
        onSelect,
        buttonComponent,
        buttonComponentProps,
        onChangeFileExplorerVisibility,
    }) => {
        const [isSelectFileDialogOpen, setIsSelectFileDialogOpen] =
            React.useState(false);
        const fileExplorerOptions: Partial<FileExplorerProps> = {};

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
                    <FileExplorer
                        style={{ padding: '0 .5em' }}
                        fileFilter={fileFilter}
                        multiple={multiple}
                        onSelect={(result) => {
                            setIsSelectFileDialogOpen(false);
                            onSelect?.(result);
                        }}
                        {...fileExplorerOptions}
                    />
                </Dialog>
            </>
        );
    }
);
SelectFileButton.displayName = 'SelectFileButton';
