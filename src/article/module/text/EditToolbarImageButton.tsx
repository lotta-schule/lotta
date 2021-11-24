import * as React from 'react';
import { Image as ImageIcon } from '@material-ui/icons';
import { Range } from 'slate';
import { useSlate } from 'slate-react';
import { File } from 'util/model';
import { FileModel } from 'model';
import { Button } from 'shared/general/button/Button';
import { insertImage } from './SlateUtils';
import { SelectFileButton } from 'shared/edit/SelectFileButton';
import { useServerData } from 'shared/ServerDataContext';

export interface EditToolbarImageButtonProps {
    onImageAdded?(): void;
}

export const EditToolbarImageButton: React.FC<EditToolbarImageButtonProps> = ({
    onImageAdded,
}) => {
    const { baseUrl } = useServerData();
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
            insertImage(editor, File.getFileRemoteLocation(baseUrl, file));
            setTimeout(() => {
                onImageAdded?.();
            }, 100);
        },
        [baseUrl, editor, lastEditorSelection, onImageAdded]
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
