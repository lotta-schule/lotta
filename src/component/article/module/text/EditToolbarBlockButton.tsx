import * as React from 'react';
import { useSlate } from 'slate-react';
import { Button } from 'component/general/button/Button';
import { isBlockActive, toggleBlock } from './SlateUtils';
import { BlockElement } from './SlateCustomTypes';

export interface EditToolbarMarkButtonProps {
    mark: BlockElement['type'];
    children?: any;
}

export const EditToolbarBlockButton: React.FC<EditToolbarMarkButtonProps> = ({
    mark,
    children,
}) => {
    const editor = useSlate();

    return (
        <Button
            selected={isBlockActive(editor, mark)}
            onMouseDown={(e) => {
                e.preventDefault();
                toggleBlock(editor, mark);
            }}
        >
            {children}
        </Button>
    );
};
