import React, { FunctionComponent, memo, useState, lazy, Suspense } from 'react';
import { FileModel } from '../../model';
import { EditOverlay } from './EditOverlay';
import { DialogTitle, LinearProgress } from '@material-ui/core';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';

const FileExplorer = lazy(() => import('component/fileExplorer/FileExplorer'));

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
                <Suspense fallback={<LinearProgress />}>
                    <DialogTitle>Datei auswählen</DialogTitle>
                    <FileExplorer
                        style={{ padding: '0 .5em' }}
                        fileFilter={fileFilter}
                        onSelect={(file: FileModel) => {
                            setIsSelectFileDialogOpen(false);
                            onSelectFile(file);
                        }}
                    />
                </Suspense>
            </ResponsiveFullScreenDialog>
        </>
    );
});