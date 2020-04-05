import React, { FunctionComponent, memo, useState } from 'react';
import { FileModel } from '../../model';
import { EditOverlay } from './EditOverlay';
import { DialogTitle } from '@material-ui/core';
import { FileExplorer } from 'component/fileExplorer/FileExplorer';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';

interface SelectFileOverlayProps {
    label: string;
    allowDeletion?: boolean;
    fileFilter?(file: FileModel): boolean;
    onSelectFile(file: FileModel | null): void;
}

export const SelectFileOverlay: FunctionComponent<SelectFileOverlayProps> = memo(({ children, label, allowDeletion, fileFilter, onSelectFile }) => {
    const [isSelectFileDialogOpen, setIsSelectFileDialogOpen] = useState(false);
    const onClickRemove = allowDeletion ? (() => onSelectFile(null)) : undefined;
    return (
        <>
            <EditOverlay label={label} onClick={() => setIsSelectFileDialogOpen(true)} onClickRemove={onClickRemove}>
                {children}
            </EditOverlay>
            <ResponsiveFullScreenDialog open={isSelectFileDialogOpen} onClose={() => setIsSelectFileDialogOpen(false)} fullWidth>
                <DialogTitle>Datei auswählen</DialogTitle>
                <FileExplorer
                    style={{ padding: '0 .5em' }}
                    fileFilter={fileFilter}
                    onSelect={(file: FileModel) => {
                        setIsSelectFileDialogOpen(false);
                        onSelectFile(file);
                    }}
                />
            </ResponsiveFullScreenDialog>
        </>
    );
});