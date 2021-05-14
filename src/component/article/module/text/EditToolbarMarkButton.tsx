import * as React from 'react';
import { useSlate } from 'slate-react';
import { Button } from 'component/general/button/Button';
import { isMarkActive, toggleMark } from './SlateUtils';
import { FormattedText } from './SlateCustomTypes';

export interface EditToolbarMarkButtonProps {
    mark: keyof Omit<FormattedText, 'text'>;
    children?: any;
}

export const EditToolbarMarkButton: React.FC<EditToolbarMarkButtonProps> = ({
    mark,
    children,
}) => {
    const editor = useSlate();

    return (
        <Button
            selected={isMarkActive(editor, mark)}
            onMouseDown={(e: React.MouseEvent) => {
                e.preventDefault();
                toggleMark(editor, mark);
            }}
        >
            {children}
        </Button>
    );
};
