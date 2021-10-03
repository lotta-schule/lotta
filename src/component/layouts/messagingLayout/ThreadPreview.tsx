import * as React from 'react';
import { Badge } from '@material-ui/core';
import { UserModel, UserGroupModel } from 'model';
import { UserAvatar } from 'component/user/UserAvatar';
import { Button } from 'component/general/button/Button';
import { format } from 'date-fns';
import { useNewMessagesBadgeNumber } from '../navigation/useNewMessagesBadgeNumber';
import { User } from 'util/model';
import de from 'date-fns/locale/de';
import clsx from 'clsx';

import styles from './ThreadPreview.module.scss';

export interface ThreadPreviewProps {
    counterpart: UserModel | UserGroupModel;
    selected?: boolean;
    date?: Date;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const ThreadPreview = React.memo<ThreadPreviewProps>(
    ({ selected, counterpart, date, onClick }) => {
        const newMessagesBadgeNumber = useNewMessagesBadgeNumber(
            (counterpart as UserModel).avatarImageFile !== undefined
                ? { user: counterpart as UserModel }
                : { group: counterpart as UserGroupModel }
        );

        return (
            <Button
                onClick={onClick}
                className={clsx(styles.root, { [styles.selected]: selected })}
            >
                {(counterpart as UserModel).avatarImageFile && (
                    <UserAvatar
                        user={counterpart as UserModel}
                        size={50}
                        classes={{ root: styles.userAvatar }}
                    />
                )}
                <div className={styles.buttonLabel}>
                    <Badge
                        badgeContent={newMessagesBadgeNumber}
                        color={'primary'}
                    >
                        {User.getName(counterpart as UserModel)}
                    </Badge>
                </div>
                <div className={styles.dateLabel}>
                    {date && format(date, 'P', { locale: de })}
                </div>
            </Button>
        );
    }
);
ThreadPreview.displayName = 'ThreadPreview';
