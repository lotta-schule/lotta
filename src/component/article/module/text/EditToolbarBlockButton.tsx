import * as React from 'react';
import { useSlate } from 'slate-react';
import { Button } from 'component/general/button/Button';
import { Block, isBlockActive, toggleBlock } from './SlateUtils';

export interface EditToolbarMarkButtonProps {
    mark: Block;
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
