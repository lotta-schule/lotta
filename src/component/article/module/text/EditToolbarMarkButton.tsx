import React, { FC } from 'react';
import { useSlate } from 'slate-react';
import { ToggleButton } from '@material-ui/lab';
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
        <ToggleButton
            size={'small'}
            value={mark}
            selected={isMarkActive(editor, mark)}
            onMouseDown={(e) => {
                e.preventDefault();
                toggleMark(editor, mark);
            }}
        >
            {children}
        </ToggleButton>
    );
};
