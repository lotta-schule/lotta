import * as React from 'react';
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
import clsx from 'clsx';

import styles from './WidgetIcon.module.scss';

export const iconNameMapping: Record<
    string,
    | typeof Lens
    | typeof Bookmark
    | typeof CalendarToday
    | typeof AccountCircle
    | typeof CheckCircle
    | typeof Work
    | typeof ChatBubble
    | typeof Folder
    | typeof School
    | typeof Cloud
    | typeof MenuBook
    | typeof Label
    | typeof SportsSoccer
    | typeof InsertDriveFile
    | typeof Search
    | typeof Extension
    | typeof Favorite
> = {
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

export const WidgetIcon = React.memo<WidgetIconProps>(
    ({ icon, size, className }) => {
        return (
            <div
                className={clsx(styles.root, className, {
                    [styles.primaryColor]: icon?.overlayTextColor === 'primary',
                    [styles.secondaryColor]:
                        icon?.overlayTextColor === 'secondary',
                })}
                style={{ width: size, height: size }}
            >
                <div className={styles.icon}>
                    {React.createElement(
                        iconNameMapping[icon?.iconName ?? 'lens'],
                        {
                            color: 'secondary',
                            className: styles.iconSvg,
                            style: { height: size, width: size },
                        }
                    )}
                </div>
                <div className={styles.overlayText} style={{ fontSize: size }}>
                    <span>{icon?.overlayText}</span>
                </div>
            </div>
        );
    }
);
WidgetIcon.displayName = 'WidgetIcon';
