import { Close } from '@material-ui/icons';
import * as React from 'react';
import { Button } from '../button/Button';

import './tag.scss';

export interface TagProps {
    onDelete?: Function;
    children: React.ReactNode;
}

export const Tag = React.memo<TagProps>(({ onDelete, children }) => {
    return (
        <div data-testid={'Tag'} className={'lotta-tag'}>
            {children}
            {onDelete && (
                <Button
                    small
                    className={'lotta-tag__delete-button'}
                    aria-label={`Tag ${children} löschen`}
                    onClick={() => onDelete()}
                    icon={<Close />}
                />
            )}
        </div>
    );
});
