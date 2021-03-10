import React, { memo, useState, useMemo, useEffect } from 'react';
import { Node, createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import {
    renderElement,
    renderLeaf,
    withImages,
    withLinks,
    getNormalizedSlateState,
} from './SlateUtils';
import { ContentModuleModel } from '../../../../model';

interface ShowProps {
    contentModule: ContentModuleModel<{ nodes: Node[] }>;
}

export const Show = memo<ShowProps>(({ contentModule }) => {
    const [editorState, setEditorState] = useState<Node[]>([]);

    useEffect(() => {
        setEditorState(
            getNormalizedSlateState(contentModule.content?.nodes ?? [])
        );
    }, [contentModule.content]);

    const editor = useMemo(
        () => withImages(withLinks(withReact(createEditor()))),
        []
    );

    return (
        <Slate editor={editor} value={editorState} onChange={() => {}}>
            <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                readOnly
            />
        </Slate>
    );
});
