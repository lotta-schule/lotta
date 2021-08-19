import * as React from 'react';
import { FileModel } from '../../model';
import { EditOverlay } from './EditOverlay';
import { DialogTitle, CircularProgress } from '@material-ui/core';
import { ResponsiveFullScreenDialog } from 'component/dialog/ResponsiveFullScreenDialog';

const FileExplorer = React.lazy(
    () => import('component/fileExplorer/FileExplorer')
);

interface SelectFileOverlayProps {
    label: string;
    allowDeletion?: boolean;
    style?: React.CSSProperties;
    fileFilter?(file: FileModel): boolean;
    onSelectFile(file: FileModel | null): void;
}

export const SelectFileOverlay: React.FunctionComponent<SelectFileOverlayProps> = React.memo(
    ({ children, label, allowDeletion, fileFilter, style, onSelectFile }) => {
        const [
            isSelectFileDialogOpen,
            setIsSelectFileDialogOpen,
        ] = React.useState(false);
        const onClickRemove = allowDeletion
            ? () => onSelectFile(null)
            : undefined;
        return (
            <>
                <EditOverlay
                    style={style}
                    label={label}
                    onClick={() => setIsSelectFileDialogOpen(true)}
                    onClickRemove={onClickRemove}
                >
                    {children}
                </EditOverlay>
                <ResponsiveFullScreenDialog
                    open={isSelectFileDialogOpen}
                    onClose={() => setIsSelectFileDialogOpen(false)}
                    fullWidth
                >
                    <React.Suspense fallback={<CircularProgress />}>
                        <DialogTitle>Datei auswählen</DialogTitle>
                        <FileExplorer
                            style={{ padding: '0 .5em' }}
                            fileFilter={fileFilter}
                            onSelect={(file: FileModel) => {
                                setIsSelectFileDialogOpen(false);
                                onSelectFile(file);
                            }}
                        />
                    </React.Suspense>
                </ResponsiveFullScreenDialog>
            </>
        );
    }
);
