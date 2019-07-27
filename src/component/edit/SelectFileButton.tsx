import React, { FunctionComponent, memo, useState } from 'react';
import { FileModel } from '../../model';
import { Dialog, DialogTitle, Button } from '@material-ui/core';
import { FileExplorer } from 'component/fileExplorer/FileExplorer';

interface SelectFileButtonProps {
    label: string;
    fileFilter?(file: FileModel): boolean;
    onSelectFile(file: FileModel): void;
}

export const SelectFileButton: FunctionComponent<SelectFileButtonProps> = memo(({ children, label, fileFilter, onSelectFile }) => {
    const [isSelectFileDialogOpen, setIsSelectFileDialogOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setIsSelectFileDialogOpen(true)}>{label}</Button>
            <Dialog open={isSelectFileDialogOpen} onClose={() => setIsSelectFileDialogOpen(false)} fullWidth>
                <DialogTitle>Datei auswählen</DialogTitle>
                <FileExplorer
                    disableEditColumn
                    style={{ padding: '0 .5em' }}
                    fileFilter={fileFilter}
                    onSelectFile={file => {
                        setIsSelectFileDialogOpen(false);
                        onSelectFile(file);
                    }}
                />
            </Dialog>
        </>
    );
});