import * as React from 'react';
import { useSlate } from 'slate-react';
import { Range } from 'slate';
import { Link } from '@material-ui/icons';
import { Button } from 'component/general/button/Button';
import { isLinkActive, unwrapLink, insertLink } from './SlateUtils';

export const EditToolbarLinkButton: React.FC = () => {
    const editor = useSlate();

    return (
        <Button
            selected={isLinkActive(editor)}
            icon={<Link />}
            onMouseDown={(e: React.MouseEvent) => {
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
        />
    );
};
