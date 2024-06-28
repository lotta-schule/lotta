import * as React from 'react';
import { ContentModuleModel } from 'model';
import { Slate, withReact, Editable } from 'slate-react';
import { Node } from './SlateCustomTypes';
import { createEditor, Descendant } from 'slate';
import {
  renderElement,
  renderLeaf,
  withImages,
  withLinks,
  getNormalizedSlateState,
  onKeyDownFactory,
} from './SlateUtils';
import { EditToolbar } from './EditToolbar';

interface EditProps {
  contentModule: ContentModuleModel<{ nodes: Node[] }>;
  onUpdateModule(contentModule: ContentModuleModel<{ nodes: Node[] }>): void;
}

export const Edit = React.memo<EditProps>(
  ({ contentModule, onUpdateModule }) => {
    const [editorState, setEditorState] = React.useState(
      getNormalizedSlateState(contentModule.content?.nodes ?? [])
    );

    const editor = React.useMemo(
      () => withImages(withLinks(withReact(createEditor()))),
      []
    );

    const onKeyDown = React.useMemo(() => onKeyDownFactory(editor), [editor]);

    return (
      <Slate
        editor={editor}
        value={editorState as Descendant[]}
        onChange={(value) => {
          setEditorState(value);
          onUpdateModule({
            ...contentModule,
            content: { nodes: value },
          });
        }}
      >
        <EditToolbar />
        <Editable
          onKeyDown={onKeyDown}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </Slate>
    );
  }
);
Edit.displayName = 'TextEdit';
