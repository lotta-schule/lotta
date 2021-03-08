import React, { FC } from 'react';
import { useSlate } from 'slate-react';
import { Range } from 'slate';
import { Link } from '@material-ui/icons';
import { ToggleButton } from '@material-ui/lab';
import { isLinkActive, unwrapLink, insertLink } from './SlateUtils';

export const EditToolbarLinkButton: FC = () => {
    const editor = useSlate();

    return (
        <ToggleButton
            size={'small'}
            value={'link'}
            selected={isLinkActive(editor)}
            onMouseDown={(e) => {
                e.preventDefault();
                if (isLinkActive(editor)) {
                    unwrapLink(editor);
                } else {
                    const url = window.prompt(
                        'Ziel-URL des Links eingeben:',
                        'https://lotta.schule'
                    );
                    const isCollapsed =
                        editor.selection && Range.isCollapsed(editor.selection);
                    if (url) {
                        insertLink(
                            editor,
                            url,
                            (isCollapsed &&
                                window.prompt('Beschreibung des Links', url)) ||
                                undefined
                        );
                    }
                }
            }}
        >
            <Link />
        </ToggleButton>
    );
};
