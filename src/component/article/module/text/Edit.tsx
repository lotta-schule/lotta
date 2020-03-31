import React, { memo, useState, useMemo, useEffect } from 'react';
import { ContentModuleModel, } from '../../../../model';
import { Slate, withReact, Editable } from 'slate-react';
import { Node, createEditor } from 'slate';
import { deserialize, renderElement, renderLeaf, serialize, withImages, withLinks } from './SlateUtils';
import { EditToolbar } from './EditToolbar';

interface EditProps {
    contentModule: ContentModuleModel;
    onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Edit = memo<EditProps>(({ contentModule, onUpdateModule }) => {

    const [editorState, setEditorState] = useState<Node[]>(contentModule.text ? deserialize(contentModule.text) : []);
    const [isSaveRequested, setIsSaveRequested] = useState(false);

    const editor = useMemo(() => withImages(withLinks(withReact(createEditor()))), []);

    useEffect(() => {
        if (isSaveRequested) {
            saveStateToContentModule();
            setIsSaveRequested(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSaveRequested, editorState]);

    const saveStateToContentModule = () => {
        onUpdateModule({
            ...contentModule,
            text: serialize(editorState)
        });
    };

    return (
        <Slate editor={editor} value={editorState} onChange={value => setEditorState(value)}>
            <EditToolbar onRequestSave={() => setIsSaveRequested(true)} />
            <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                onBlur={() => saveStateToContentModule()}
            />
        </Slate>
    );
});