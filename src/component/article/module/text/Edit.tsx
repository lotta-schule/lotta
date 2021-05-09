import React, { memo, useState, useMemo, useEffect } from 'react';
import { ContentModuleModel } from '../../../../model';
import { Slate, withReact, Editable } from 'slate-react';
import { Node } from './SlateCustomTypes';
import { createEditor, Descendant } from 'slate';
import {
    renderElement,
    renderLeaf,
    withImages,
    withLinks,
    getNormalizedSlateState,
} from './SlateUtils';
import { EditToolbar } from './EditToolbar';

interface EditProps {
    contentModule: ContentModuleModel<{ nodes: Node[] }>;
    onUpdateModule(contentModule: ContentModuleModel<{ nodes: Node[] }>): void;
}

export const Edit = memo<EditProps>(({ contentModule, onUpdateModule }) => {
    const [editorState, setEditorState] = useState(
        getNormalizedSlateState(contentModule.content?.nodes ?? [])
    );
    const [isSaveRequested, setIsSaveRequested] = useState(false);

    const editor = useMemo(
        () => withImages(withLinks(withReact(createEditor()))),
        []
    );

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
            content: { nodes: editorState },
        });
    };

    return (
        <Slate
            editor={editor}
            value={editorState as Descendant[]}
            onChange={(value) => setEditorState(value)}
        >
            <EditToolbar onRequestSave={() => setIsSaveRequested(true)} />
            <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                onBlur={() => saveStateToContentModule()}
            />
        </Slate>
    );
});
