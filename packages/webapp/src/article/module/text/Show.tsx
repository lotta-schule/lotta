import * as React from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { Node } from './SlateCustomTypes';
import {
  renderElement,
  renderLeaf,
  withImages,
  withLinks,
  getNormalizedSlateState,
} from './SlateUtils';
import { ContentModuleModel } from '../../../model';

interface ShowProps {
  contentModule: ContentModuleModel<{ nodes: Node[] }>;
}

export const Show = React.memo<ShowProps>(({ contentModule }) => {
  const [editorState, setEditorState] = React.useState<Node[]>(
    getNormalizedSlateState(contentModule.content?.nodes ?? [])
  );

  React.useEffect(() => {
    setEditorState(getNormalizedSlateState(contentModule.content?.nodes ?? []));
  }, [contentModule.content]);

  const editor = React.useMemo(
    () => withImages(withLinks(withReact(createEditor()))),
    []
  );

  return (
    <Slate
      editor={editor}
      value={editorState as Descendant[]}
      onChange={() => {}}
    >
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        readOnly
      />
    </Slate>
  );
});
Show.displayName = 'TextShow';
