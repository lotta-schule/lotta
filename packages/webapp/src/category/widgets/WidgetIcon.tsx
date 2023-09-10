import * as React from 'react';

import { Icon } from 'shared/Icon';
import { faBookmark, faFolder } from '@fortawesome/free-regular-svg-icons';
import {
  faBookOpen,
  faBriefcase,
  faCalendar,
  faCircle,
  faCircleCheck,
  faCircleUser,
  faCloud,
  faComment,
  faFile,
  faGraduationCap,
  faHeart,
  faMagnifyingGlass,
  faPuzzlePiece,
  faTag,
  faVolleyball,
} from '@fortawesome/free-solid-svg-icons';

import { WidgetIconModel } from 'model';
import clsx from 'clsx';

import styles from './WidgetIcon.module.scss';

export const iconNameMapping: Record<
  string,
  | typeof faCircle
  | typeof faBookmark
  | typeof faCalendar
  | typeof faCircleUser
  | typeof faCircleCheck
  | typeof faBriefcase
  | typeof faComment
  | typeof faFolder
  | typeof faGraduationCap
  | typeof faCloud
  | typeof faBookOpen
  | typeof faTag
  | typeof faVolleyball
  | typeof faFile
  | typeof faMagnifyingGlass
  | typeof faPuzzlePiece
  | typeof faHeart
> = {
  lens: faCircle,
  bookmark: faBookmark,
  calendartoday: faCalendar,
  label: faTag,
  accountcircle: faCircleUser,
  checkcircle: faCircleCheck,
  work: faBriefcase,
  chatbubble: faComment,
  folder: faFolder,
  cloud: faCloud,
  menubook: faBookOpen,
  school: faGraduationCap,
  sportssoccer: faVolleyball,
  insertdrivefile: faFile,
  search: faMagnifyingGlass,
  extension: faPuzzlePiece,
  favorite: faHeart,
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
          [styles.secondaryColor]: icon?.overlayTextColor === 'secondary',
        })}
      >
        <div className={styles.icon}>
          <Icon
            icon={iconNameMapping[icon?.iconName ?? 'lens']}
            color={'secondary'}
            className={styles.iconSvg}
            size={'xl'}
          />
        </div>
        <div className={styles.overlayText} style={{ fontSize: size }}>
          <span>{icon?.overlayText}</span>
        </div>
      </div>
    );
  }
);
WidgetIcon.displayName = 'WidgetIcon';
