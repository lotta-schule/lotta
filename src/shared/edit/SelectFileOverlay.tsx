import * as React from 'react';
import { FileModel } from 'model';
import { EditOverlay } from './EditOverlay';
import { Dialog } from '@lotta-schule/hubert';
import FileExplorer from 'shared/fileExplorer/FileExplorer';

interface SelectFileOverlayProps {
    label: string;
    description?: string;
    allowDeletion?: boolean;
    style?: React.CSSProperties;
    fileFilter?(file: FileModel): boolean;
    onSelectFile(file: FileModel | null): void;
}

export const SelectFileOverlay: React.FunctionComponent<SelectFileOverlayProps> =
    React.memo(
        ({
            children,
            label,
            description,
            allowDeletion,
            fileFilter,
            style,
            onSelectFile,
        }) => {
            const [isSelectFileDialogOpen, setIsSelectFileDialogOpen] =
                React.useState(false);
            const onClickRemove = allowDeletion
                ? () => onSelectFile(null)
                : undefined;
            return (
                <>
                    <EditOverlay
                        style={style}
                        label={label}
                        description={description}
                        onClick={() => setIsSelectFileDialogOpen(true)}
                        onClickRemove={onClickRemove}
                    >
                        {children}
                    </EditOverlay>
                    <Dialog
                        open={isSelectFileDialogOpen}
                        onRequestClose={() => setIsSelectFileDialogOpen(false)}
                        title={'Datei auswählen'}
                    >
                        <FileExplorer
                            style={{ padding: '0 .5em' }}
                            fileFilter={fileFilter}
                            onSelect={(file: FileModel) => {
                                setIsSelectFileDialogOpen(false);
                                onSelectFile(file);
                            }}
                        />
                    </Dialog>
                </>
            );
        }
    );
SelectFileOverlay.displayName = 'SelectFileOverlay';
