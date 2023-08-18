import * as React from 'react';
import { useSlate } from 'slate-react';
import { Button } from '@lotta-schule/hubert';
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
            onMouseDown={(e: React.MouseEvent) => {
                e.preventDefault();
                toggleBlock(editor, mark);
            }}
        >
            {children}
        </Button>
    );
};
