import * as React from 'react';
import { Image as ImageIcon } from '@material-ui/icons';
import { Range } from 'slate';
import { useSlate } from 'slate-react';
import { FileModel } from 'model';
import { Button } from '@lotta-schule/hubert';
import { insertImage } from './SlateUtils';
import { SelectFileButton } from 'shared/edit/SelectFileButton';

export interface EditToolbarImageButtonProps {
    onImageAdded?(): void;
}

export const EditToolbarImageButton: React.FC<EditToolbarImageButtonProps> = ({
    onImageAdded,
}) => {
    const editor = useSlate();
    const [lastEditorSelection, setLastEditorSelection] =
        React.useState<Range | null>(null);

    const onClickImage = React.useCallback(
        (file: FileModel) => {
            if (lastEditorSelection) {
                editor.apply({
                    type: 'set_selection',
                    properties: null,
                    newProperties: lastEditorSelection,
                });
            }
            insertImage(editor, file);
            setTimeout(() => {
                onImageAdded?.();
            }, 100);
        },
        [editor, lastEditorSelection, onImageAdded]
    );

    return (
        <SelectFileButton
            label={<ImageIcon />}
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
