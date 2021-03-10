import React, { memo, useState, useEffect } from 'react';
import { FileModel } from '../../model';
import { DialogTitle, Button } from '@material-ui/core';
import {
    FileExplorer,
    FileExplorerProps,
} from 'component/fileExplorer/FileExplorer';
import { ButtonProps } from '@material-ui/core/Button';
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

export const SelectFileButton = memo<SelectFileButtonProps>(
    ({
        label,
        fileFilter,
        multiple,
        onSelect,
        buttonComponent,
        buttonComponentProps,
        onChangeFileExplorerVisibility,
    }) => {
        const [isSelectFileDialogOpen, setIsSelectFileDialogOpen] = useState(
            false
        );
        const fileExplorerOptions: Partial<FileExplorerProps> = {};

        useEffect(() => {
            onChangeFileExplorerVisibility?.(isSelectFileDialogOpen);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isSelectFileDialogOpen]);

        return (
            <>
                {React.createElement<ButtonProps>(
                    buttonComponent || Button,
                    {
                        onClick: (e) => {
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
