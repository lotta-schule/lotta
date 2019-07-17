import React, { FunctionComponent, memo, useState } from 'react';
import { FileModel, FileModelType } from '../../model';
import { EditOverlay } from './EditOverlay';
import { Dialog, DialogTitle } from '@material-ui/core';
import { FileExplorer } from 'component/fileExplorer/FileExplorer';

interface SelectFileOverlayProps {
    label: string;
    onSelectFile(file: FileModel): void;
}

export const SelectFileOverlay: FunctionComponent<SelectFileOverlayProps> = memo(({ children, label, onSelectFile }) => {
    const [isSelectFileDialogOpen, setIsSelectFileDialogOpen] = useState(false);
    return (
        <>
            <EditOverlay label={label} onClick={() => setIsSelectFileDialogOpen(true)}>
                {children}
            </EditOverlay>
            <Dialog open={isSelectFileDialogOpen} onClose={() => setIsSelectFileDialogOpen(false)} fullWidth>
                <DialogTitle>Datei auswählen</DialogTitle>
                <FileExplorer
                    disableEditColumn
                    style={{ padding: '0 .5em' }}
                    fileFilter={f => f.fileType === FileModelType.Image}
                    onSelectFile={file => {
                        setIsSelectFileDialogOpen(false);
                        onSelectFile(file);
                    }}
                />
            </Dialog>
        </>
    );
});