import * as React from 'react';
import { useSlate } from 'slate-react';
import { Range } from 'slate';

import { Button } from '@lotta-schule/hubert';
import { isLinkActive, unwrapLink, insertLink } from './SlateUtils';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'shared/Icon';

export const EditToolbarLinkButton: React.FC = () => {
    const editor = useSlate();

    return (
        <Button
            selected={isLinkActive(editor)}
            icon={<Icon icon={faLink} />}
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
