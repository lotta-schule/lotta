import React, { memo } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Show } from './Show';
import { SelectFileButton } from 'component/edit/SelectFileButton';

interface EditProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Edit = memo<EditProps>(({ contentModule, onUpdateModule }) => {

    return (
        <>
            <Show contentModule={contentModule} onRemoveFile={file => onUpdateModule({
                ...contentModule, files: contentModule.files.filter(_file => _file.id !== file.id)
            })} />
            <SelectFileButton
                label={'Datei hinzufügen'}
                onSelectFiles={files => onUpdateModule({ ...contentModule, files: contentModule.files.concat(files) })} />
        </>
    );
});