import * as React from 'react';
import { FileModel } from '../../model';
import { DialogTitle } from '@material-ui/core';
import { Button, ButtonProps } from 'component/general/button/Button';
import {
    FileExplorer,
    FileExplorerProps,
} from 'component/fileExplorer/FileExplorer';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';

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
        const [
            isSelectFileDialogOpen,
            setIsSelectFileDialogOpen,
        ] = React.useState(false);
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
                        onClick: (e: React.MouseEvent) => {
                            e.preventDefault();
                            setIsSelectFileDialogOpen(true);
                        },
                        ...buttonComponentProps,
                    },
                    label
                )}
                <ResponsiveFullScreenDialog
                    open={isSelectFileDialogOpen}
                    onClose={() => setIsSelectFileDialogOpen(false)}
                    fullWidth
                >
                    <DialogTitle>Datei auswählen</DialogTitle>
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
                </ResponsiveFullScreenDialog>
            </>
        );
    }
);
