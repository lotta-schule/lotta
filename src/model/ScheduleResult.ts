export interface ScheduleResult {
    head: ScheduleResultHead;
    body: ScheduleResultBody;
    footer: ScheduleResultFooter;
}

export interface ScheduleResultHead {
    date: string;
    timestamp: string;
    type: string;
    filename: string;
    skipDates: string[];
}

export interface ScheduleResultBody {
    name: string;
    short: string;
    schedule: {
        id: string;
        lessonIndex: number;
        lessonName: string;
        lessonNameHasChanged?: boolean;
        teacher: string;
        teacherHasChanged?: boolean;
        room: string;
        roomHasChanged?: boolean;
        comment?: string;
    }[];
}

export interface ScheduleResultFooter {
    comments?: string[];
    supervisions?: {
        time: string;
        location: string;
    }[];
}
