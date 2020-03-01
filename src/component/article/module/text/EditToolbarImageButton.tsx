import React, { FC, useCallback } from 'react';
import { useSlate } from 'slate-react';
import { ToggleButton } from '@material-ui/lab';
import { Image } from '@material-ui/icons';
import { insertImage } from './SlateUtils';
import { SelectFileButton } from 'component/edit/SelectFileButton';
import { FileModel } from 'model';

export const EditToolbarImageButton: FC = (() => {
    const editor = useSlate();

    const onClickImage = useCallback((file: FileModel) => {
        insertImage(editor, file.remoteLocation);
    }, [editor]);

    return (
        <SelectFileButton
            buttonComponent={ToggleButton}
            buttonComponentProps={{ size: 'small', value: 'select-file' }}
            onSelectFile={onClickImage}
            label={<Image />}
        />
    );
});