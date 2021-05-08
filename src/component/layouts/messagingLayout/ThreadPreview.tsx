import * as React from 'react';
import { makeStyles, Typography, Badge } from '@material-ui/core';
import { UserModel, UserGroupModel } from 'model';
import { UserAvatar } from 'component/user/UserAvatar';
import { Button } from 'component/general/button/Button';
import { format } from 'date-fns';
import { useNewMessagesBadgeNumber } from '../navigation/useNewMessagesBadgeNumber';
import { User } from 'util/model';
import de from 'date-fns/locale/de';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        background: theme.palette.background.paper,
        borderColor: 'transparent',
        margin: theme.spacing(1, 0),
        padding: theme.spacing(1),
        overflow: 'auto',
        display: 'block',
        width: '100%',
        textTransform: 'none',
        letterSpacing: 0,
        borderRadius: 0,

        '&.selected': {
            position: 'initial',
            top: `calc(65px + (0.5 * ${theme.spacing(1)})px)`,
            zIndex: 1,
            borderLeftWidth: `calc(0.5 * ${theme.spacing(1)}px)`,
            borderLeftStyle: 'solid',
            borderLeftColor: theme.palette.secondary.main,
            borderColor: 'transparent',
            backgroundColor: theme.palette.grey[100],
        },
        '&:hover': {
            backgroundColor: [theme.palette.grey[100], '!important'],
            filter: ['none', '!important'],
        },
    },
    buttonLabel: {
        textAlign: 'left',
        alignSelf: 'center',
        fontSize: '0.9rem',
        color: theme.palette.text.primary,
    },
    userAvatar: {
        float: 'left',
        marginRight: theme.spacing(1),
        width: 40,
        height: 40,
    },
    dateLabel: {
        color: theme.palette.grey[400],
        fontSize: '0.8rem',
        textAlign: 'left',
    },
}));

export interface ThreadPreviewProps {
    counterpart: UserModel | UserGroupModel;
    selected?: boolean;
    date?: Date;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const ThreadPreview = React.memo<ThreadPreviewProps>(
    ({ selected, counterpart, date, onClick }) => {
        const styles = useStyles();
        const newMessagesBadgeNumber = useNewMessagesBadgeNumber(
            (counterpart as UserModel).avatarImageFile !== undefined
                ? { user: counterpart as UserModel }
                : { group: counterpart as UserGroupModel }
        );

        return (
            <Button
                onClick={onClick}
                className={clsx(styles.root, { selected })}
            >
                {(counterpart as UserModel).avatarImageFile && (
                    <UserAvatar
                        user={counterpart as UserModel}
                        size={50}
                        classes={{ root: styles.userAvatar }}
                    />
                )}
                <Typography
                    variant={'subtitle1'}
                    className={styles.buttonLabel}
                >
                    <Badge
                        badgeContent={newMessagesBadgeNumber}
                        color={'primary'}
                    >
                        {User.getName(counterpart as UserModel)}
                    </Badge>
                </Typography>
                <Typography variant={'body2'} className={styles.dateLabel}>
                    {date && format(date, 'P', { locale: de })}
                </Typography>
            </Button>
        );
    }
);
