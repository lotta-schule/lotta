import { ID } from './ID';
import { FileModel } from './FileModel';
import { UserGroupModel } from './UserGroupModel';
import { GET_CALENDAR_EVENTS } from 'app/(admin)/admin/calendars/_graphql';
import { ResultOf } from 'api/graphql';

export enum WidgetModelType {
  UserNavigationMobile = '{0}',
  Calendar = 'CALENDAR',
  Schedule = 'SCHEDULE',
  IFrame = 'IFRAME',
}

export interface WidgetIconModel {
  __typename?: 'WidgetIcon';
  iconName?: string;
  overlayText?: string;
  overlayTextColor?: string;
}

export type WidgetModel<T extends WidgetModelType = WidgetModelType> = {
  __typename?: 'Widget';
  id: ID;
  title: string;
  type: T;
  iconImageFile?: FileModel | null;
  groups: UserGroupModel[];
  calendarEvents?: ResultOf<typeof GET_CALENDAR_EVENTS>['calendarEvents'];
} & TypedWidgetConfiguration;

export type TypedWidgetConfiguration<
  T extends WidgetModelType = WidgetModelType,
> = {
  type: T;
} & { configuration?: { icon?: WidgetIconModel } } & (
    | { type: WidgetModelType.IFrame; configuration?: IFrameWidgetConfig }
    | {
        type: WidgetModelType.Schedule;
        configuration?: ScheduleWidgetConfig;
      }
    | {
        type: WidgetModelType.Calendar;
        configuration?: CalendarWidgetConfig;
      }
    | { type: WidgetModelType.UserNavigationMobile }
    | never
  );

export interface CalendarWidgetConfig {
  calendars?: CalendarWidgetCalendarConfig[];
}

export type CalendarWidgetCalendarConfig =
  | CalendarWidgetInternalCalendarConfig
  | CalendarWidgetExternalCalendarConfig;

export type CalendarWidgetExternalCalendarConfig = {
  type?: 'external';
  url: string;
  color?: string;
  name?: string;
  days?: number;
  // groupId?: ID;
};

export type CalendarWidgetInternalCalendarConfig = {
  type: 'internal';
  calendarId: ID;
  name?: string;
  color?: string;
  days?: number;
};

export interface ScheduleWidgetConfig {
  type?: 'IndiwareStudent' | 'IndiwareTeacher';
  schoolId?: string;
  username?: string;
  password?: string;
}

export interface IFrameWidgetConfig {
  url?: string;
}
