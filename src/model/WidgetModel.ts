import { ID } from './ID';
import { FileModel } from './FileModel';
import { UserGroupModel } from './UserGroupModel';

export enum WidgetModelType {
    UserNavigationMobile = '{0}',
    Calendar = 'CALENDAR',
    VPlan = 'VPLAN',
    TagCloud = 'TAGCLOUD',
    Schedule = 'SCHEDULE',
}

export interface WidgetIconModel {
    iconName?: string;
    overlayText?: string;
    overlayTextColor?: string;
}

export interface WidgetModel<C = any> {
    id: ID;
    title: string;
    type: WidgetModelType;
    iconImageFile?: FileModel | null;
    groups: UserGroupModel[];
    configuration: { icon?: WidgetIconModel } & C;
}

export interface CalendarWidgetConfig {
    calendars: CalendarWidgetCalendarConfig[];
}

export interface CalendarWidgetCalendarConfig {
    url: string;
    color?: string;
    name?: string;
    days?: number;
    groupId?: ID;
}

export interface ScheduleWidgetConfig {
    type: string;
    schoolId: string;
    username: string;
    password: string;
}