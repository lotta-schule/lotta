import React, { createElement, memo, ComponentType } from 'react';
import {
    Lens,
    Bookmark,
    CalendarToday,
    AccountCircle,
    CheckCircle,
    Work,
    ChatBubble,
    Folder,
    School,
    Cloud,
    MenuBook,
    Label,
    SportsSoccer,
    InsertDriveFile,
    Search,
    Extension,
    Favorite,
} from '@material-ui/icons';
import { WidgetIconModel } from 'model';
import { Typography, makeStyles, SvgIconProps } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';
import clsx from 'clsx';

export const iconNameMapping: { [key: string]: ComponentType<SvgIconProps> } = {
    lens: Lens,
    bookmark: Bookmark,
    calendartoday: CalendarToday,
    label: Label,
    accountcircle: AccountCircle,
    checkcircle: CheckCircle,
    work: Work,
    chatbubble: ChatBubble,
    folder: Folder,
    cloud: Cloud,
    menubook: MenuBook,
    school: School,
    sportssoccer: SportsSoccer,
    insertdrivefile: InsertDriveFile,
    search: Search,
    extension: Extension,
    favorite: Favorite,
};

export interface WidgetIconProps {
    icon?: WidgetIconModel;
    size: string | number;
    className?: string;
}

const useStyles = makeStyles<
    Theme,
    Pick<WidgetIconProps, 'size'> & { color?: string }
>((theme) => ({
    root: {
        position: 'relative',
        height: ({ size }) => size,
        width: ({ size }) => size,
    },
    icon: {
        textAlign: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
    },
    iconSvg: {
        height: ({ size }) => size,
        padding: 5,
        width: 'auto',
        fontSize: '1em',
        boxSizing: 'border-box',
    },
    overlayText: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
        fontSize: ({ size }) => size,
        height: '100%',
        width: '100%',
        '& span': {
            color: ({ color }) =>
                color
                    ? ((theme.palette as any)[color] as any)?.main ??
                      theme.palette.background.paper
                    : theme.palette.background.paper,
            verticalAlign: 'middle',
            fontWeight: 'bold',
            fontSize: '.3em',
            paddingTop: 2,
            lineHeight: 1,
        },
    },
}));

export const WidgetIcon = memo<WidgetIconProps>(({ icon, size, className }) => {
    const styles = useStyles({ size, color: icon?.overlayTextColor });
    return (
        <div className={clsx(styles.root, className)}>
            <div className={styles.icon}>
                {createElement(iconNameMapping[icon?.iconName ?? 'lens'], {
                    color: 'secondary',
                    className: styles.iconSvg,
                })}
            </div>
            <div className={styles.overlayText}>
                <Typography component={'span'}>{icon?.overlayText}</Typography>
            </div>
        </div>
    );
});
