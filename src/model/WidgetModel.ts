import { ID } from './ID';
import { FileModel } from './FileModel';
import { UserGroupModel } from './UserGroupModel';

export enum WidgetModelType {
    UserNavigationMobile = '{0}',
    Calendar = 'CALENDAR',
    Schedule = 'SCHEDULE',
    IFrame = 'IFRAME',
}

export interface WidgetIconModel {
    iconName?: string;
    overlayText?: string;
    overlayTextColor?: string;
}

export type WidgetModel<T extends WidgetModelType = WidgetModelType> = {
    id: ID;
    title: string;
    type: T;
    iconImageFile?: FileModel | null;
    groups: UserGroupModel[];
} & TypedWidgetConfiguration;

export type TypedWidgetConfiguration<
    T extends WidgetModelType = WidgetModelType
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

export interface CalendarWidgetCalendarConfig {
    url?: string;
    color?: string;
    name?: string;
    days?: number;
    groupId?: ID;
}

export interface ScheduleWidgetConfig {
    type?: 'IndiwareStudent' | 'IndiwareTeacher';
    schoolId?: string;
    username?: string;
    password?: string;
}

export interface IFrameWidgetConfig {
    url?: string;
}
