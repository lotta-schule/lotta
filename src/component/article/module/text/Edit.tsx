import React, { memo, useState, useMemo } from 'react';
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

    const editor = useMemo(() => withImages(withLinks(withReact(createEditor()))), []);

    return (
        <Slate editor={editor} value={editorState} onChange={value => setEditorState(value)}>
            <EditToolbar />
            <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                onBlur={() => {
                    onUpdateModule({
                        ...contentModule,
                        text: serialize(editorState)
                    });
                }}
            />
        </Slate>
    );
});