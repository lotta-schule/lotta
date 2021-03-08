import React, { FC } from 'react';
import { useSlate } from 'slate-react';
import { ToggleButton } from '@material-ui/lab';
import { Block, isBlockActive, toggleBlock } from './SlateUtils';

export interface EditToolbarMarkButtonProps {
    mark: Block;
    children?: any;
}

export const EditToolbarBlockButton: FC<EditToolbarMarkButtonProps> = ({
    mark,
    children,
}) => {
    const editor = useSlate();

    return (
        <ToggleButton
            size={'small'}
            value={mark}
            selected={isBlockActive(editor, mark)}
            onMouseDown={(e) => {
                e.preventDefault();
                toggleBlock(editor, mark);
            }}
        >
            {children}
        </ToggleButton>
    );
};
