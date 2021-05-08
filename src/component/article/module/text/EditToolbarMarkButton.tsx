import React, { FC } from 'react';
import { useSlate } from 'slate-react';
import { Button } from 'component/general/button/Button';
import { Mark, isMarkActive, toggleMark } from './SlateUtils';

export interface EditToolbarMarkButtonProps {
    mark: Mark;
    children?: any;
}

export const EditToolbarMarkButton: FC<EditToolbarMarkButtonProps> = ({
    mark,
    children,
}) => {
    const editor = useSlate();

    return (
        <Button
            selected={isMarkActive(editor, mark)}
            onMouseDown={(e) => {
                e.preventDefault();
                toggleMark(editor, mark);
            }}
        >
            {children}
        </Button>
    );
};
