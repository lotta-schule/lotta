import React, { memo, useState, useMemo, useEffect } from 'react';
import { Node, createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { deserialize, renderElement, renderLeaf, withImages, withLinks } from './SlateUtils';
import { ContentModuleModel } from '../../../../model';

interface ShowProps {
    contentModule: ContentModuleModel;
}

export const Show = memo<ShowProps>(({ contentModule }) => {

    const [editorState, setEditorState] = useState<Node[]>([]);

    useEffect(() => {
        setEditorState(contentModule.text ? deserialize(contentModule.text) : []);
    }, [contentModule.text]);

    const editor = useMemo(() => withImages(withLinks(withReact(createEditor()))), []);

    return (
        <Slate editor={editor} value={editorState} onChange={() => { }}>
            <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                readOnly
            />
        </Slate>
    );
});