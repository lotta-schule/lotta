import React, { FC, useCallback, useState } from 'react';
import { Button } from 'component/general/button/Button';
import { useSlate } from 'slate-react';
import { Range } from 'slate';
import { Image } from '@material-ui/icons';
import { insertImage } from './SlateUtils';
import { SelectFileButton } from 'component/edit/SelectFileButton';
import { FileModel } from 'model';

export interface EditToolbarImageButtonProps {
    onImageAdded?(): void;
}

export const EditToolbarImageButton: FC<EditToolbarImageButtonProps> = ({
    onImageAdded,
}) => {
    const editor = useSlate();
    const [
        lastEditorSelection,
        setLastEditorSelection,
    ] = useState<Range | null>(null);

    const onClickImage = useCallback(
        (file: FileModel) => {
            if (lastEditorSelection) {
                editor.apply({
                    type: 'set_selection',
                    properties: null,
                    newProperties: lastEditorSelection,
                });
            }
            insertImage(editor, file.remoteLocation);
            setTimeout(() => {
                onImageAdded?.();
            }, 100);
        },
        [editor, lastEditorSelection, onImageAdded]
    );

    return (
        <SelectFileButton
            label={<Image />}
            buttonComponent={Button}
            buttonComponentProps={{ size: 'small', value: 'select-file' }}
            onSelect={onClickImage}
            onChangeFileExplorerVisibility={(visible) => {
                if (visible) {
                    setLastEditorSelection(editor.selection);
                }
            }}
        />
    );
};
