import React, { FunctionComponent, memo, useState } from 'react';
import { FileModel } from '../../model';
import { Dialog, DialogTitle, Button } from '@material-ui/core';
import { FileExplorer, FileExplorerProps } from 'component/fileExplorer/FileExplorer';
import { ButtonProps } from '@material-ui/core/Button';

interface SelectFileButtonProps {
    label: string | JSX.Element;
    buttonComponent?: any;
    buttonComponentProps?: any;
    fileFilter?(file: FileModel): boolean;
    onSelectFile?(file: FileModel): void;
    onSelectFiles?(file: FileModel[]): void;
}

export const SelectFileButton: FunctionComponent<SelectFileButtonProps> = memo(({ label, fileFilter, onSelectFile, onSelectFiles, buttonComponent, buttonComponentProps }) => {
    const [isSelectFileDialogOpen, setIsSelectFileDialogOpen] = useState(false);
    const fileExplorerOptions: Partial<FileExplorerProps> = {};
    if (onSelectFile) {
        fileExplorerOptions.onSelectFile = file => {
            setIsSelectFileDialogOpen(false);
            onSelectFile(file);
        };
    }
    if (onSelectFiles) {
        fileExplorerOptions.onSelectFiles = files => {
            setIsSelectFileDialogOpen(false);
            onSelectFiles(files);
        }
    }
    return (
        <>
            {React.createElement<ButtonProps>(buttonComponent || Button, {
                onClick: (e) => {
                    e.preventDefault();
                    setIsSelectFileDialogOpen(true);
                },
                ...buttonComponentProps
            }, label)}
            <Dialog open={isSelectFileDialogOpen} onClose={() => setIsSelectFileDialogOpen(false)} fullWidth>
                <DialogTitle>Datei auswählen</DialogTitle>
                <FileExplorer
                    style={{ padding: '0 .5em' }}
                    fileFilter={fileFilter}
                    {...fileExplorerOptions}
                />
            </Dialog>
        </>
    );
});