import {
    adminGroup,
    lehrerGroup,
    elternGroup,
    schuelerGroup,
} from './Accounts';
import {
    CalendarWidgetConfig,
    ClientModel,
    ScheduleWidgetConfig,
    WidgetModel,
    WidgetModelType,
} from 'model';

/**
 *
 * System
 *
 */

export const system = {
    id: '1', // add ID for cache
    title: 'DerEineVonHier',
    slug: 'derdiedas',
    insertedAt: '2014-03-08 12:00',
    updatedAt: '2014-03-08 12:00',
    host: 'info.lotta.schule',
    userMaxStorageConfig: 20,
    groups: [adminGroup, lehrerGroup, elternGroup, schuelerGroup],
    customDomains: [
        {
            host: 'chezmoi.fr',
            insertedAt: '2014-12-24 18:00',
            updatedAt: '2014-12-24 18:00',
            id: '1',
            isMainDomain: true,
        },
    ],
    customTheme: {},
    logoImageFile: null,
    backgroundImageFile: null,
} as ClientModel;

/**
 *
 *
 * Categories
 *
 *
 *
 */

export const StartseiteCategory = {
    id: '1',
    sortKey: 0,
    title: 'Start',
    isHomepage: true,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: null,
    layoutName: null,
    redirect: null,
    groups: [],
};

export const FaecherCategory = {
    id: '2',
    sortKey: 1,
    title: 'Fächer',
    isHomepage: false,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: null,
    layoutName: null,
    redirect: null,
    groups: [],
};

export const MaterialCategory = {
    id: '3',
    sortKey: 5,
    title: 'Material',
    isHomepage: false,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: null,
    layoutName: null,
    redirect: null,
    groups: [],
};

export const ImpressumCategory = {
    id: '4',
    sortKey: 7,
    title: 'Impressum',
    isHomepage: false,
    isSidenav: true,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: null,
    layoutName: null,
    redirect: null,
    groups: [],
};

export const DatenschutzCategory = {
    id: '5',
    sortKey: 10,
    title: 'Datenschutz',
    isHomepage: false,
    isSidenav: true,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: null,
    layoutName: null,
    redirect: null,
    groups: [],
};

export const MatheCategory = {
    id: '20',
    sortKey: 0,
    title: 'Mathe',
    isHomepage: false,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: { ...FaecherCategory },
    layoutName: null,
    redirect: null,
    groups: [],
};

export const SportCategory = {
    id: '21',
    sortKey: 10,
    title: 'Sport',
    isHomepage: false,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: { ...FaecherCategory },
    layoutName: null,
    redirect: null,
    groups: [],
};

export const KunstCategory = {
    id: '22',
    sortKey: 20,
    title: 'Kunst',
    isHomepage: false,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: { ...FaecherCategory },
    layoutName: null,
    redirect: null,
    groups: [],
};

export const MusikCategory = {
    id: '23',
    sortKey: 30,
    title: 'Musik',
    isHomepage: false,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: { ...FaecherCategory },
    layoutName: null,
    redirect: null,
    groups: [],
};

export const DeutschCategory = {
    id: '24',
    sortKey: 40,
    title: 'Deutsch',
    isHomepage: false,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: { ...FaecherCategory },
    layoutName: null,
    redirect: null,
    groups: [],
};

export const FrancaisCategory = {
    id: '25',
    sortKey: 50,
    title: 'Français',
    isHomepage: false,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: { ...FaecherCategory },
    layoutName: null,
    redirect: null,
    groups: [],
};

export const KlassenarbeitenUCategory = {
    id: '31',
    sortKey: 0,
    title: 'Klassenarbeiten Unterstufe',
    isHomepage: false,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: { ...MaterialCategory },
    layoutName: null,
    redirect: null,
    groups: [],
};

export const KlassenarbeitenOCategory = {
    id: '32',
    sortKey: 10,
    title: 'Klassenarbeiten Oberstufe',
    isHomepage: false,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: { ...MaterialCategory },
    layoutName: null,
    redirect: null,
    groups: [],
};

export const HausaufgabenCategory = {
    id: '33',
    sortKey: 20,
    title: 'Hausaufgaben',
    isHomepage: false,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: { ...MaterialCategory },
    layoutName: null,
    redirect: null,
    groups: [],
};

export const ArbeitsblätterCategory = {
    id: '34',
    sortKey: 30,
    title: 'Arbeitsblätter',
    isHomepage: false,
    isSidenav: false,
    hideArticlesFromHomepage: false,
    bannerImageFile: null,
    category: { ...MaterialCategory },
    layoutName: null,
    redirect: null,
    groups: [],
};

export const allCategories = [
    StartseiteCategory,
    FaecherCategory,
    MaterialCategory,
    ImpressumCategory,
    DatenschutzCategory,
    MatheCategory,
    SportCategory,
    KunstCategory,
    MusikCategory,
    DeutschCategory,
    FrancaisCategory,
    KlassenarbeitenUCategory,
    KlassenarbeitenOCategory,
    HausaufgabenCategory,
    ArbeitsblätterCategory,
];

export const VPSchuelerWidget: WidgetModel<ScheduleWidgetConfig> = {
    id: '91800',
    title: 'VP Schüler',
    type: WidgetModelType.VPlan,
    groups: [],
    configuration: {
        type: 'IndiwareStudent',
        schoolId: '1010',
        username: 'l3hr3r',
        password: 'p@ssw0rd',
    },
};

export const VPLehrerWidget: WidgetModel<ScheduleWidgetConfig> = {
    id: '91801',
    title: 'VP Lehrer',
    type: WidgetModelType.VPlan,
    groups: [],
    configuration: {
        type: 'IndiwareTeacher',
        schoolId: '1010',
        username: 'l3hr3r',
        password: 'p@ssw0rd',
    },
};

export const CalendarKlassenarbeiten: WidgetModel<CalendarWidgetConfig> = {
    id: '91801',
    title: 'VP Lehrer',
    type: WidgetModelType.VPlan,
    groups: [],
    configuration: {
        calendars: [
            {
                url: 'http://calendar',
                color: 'red',
                name: 'Kalender',
                days: 14,
            },
        ],
    },
};

export const ScheduleResponse = {
    schedule: {
        id: 'SCHEDULE:111',
        head: {
            date: 'Montag, 16. November 2020',
            filename: 'PlanKl20201116.xml',
            skipDates: [
                'Tue, 17 Nov 2020 00:00:00 GMT',
                'Thu, 19 Nov 2020 00:00:00 GMT',
                'Fri, 20 Nov 2020 00:00:00 GMT',
                'Wed, 23 Dec 2020 00:00:00 GMT',
                'Thu, 24 Dec 2020 00:00:00 GMT',
                'Fri, 25 Dec 2020 00:00:00 GMT',
                'Mon, 28 Dec 2020 00:00:00 GMT',
                'Tue, 29 Dec 2020 00:00:00 GMT',
                'Wed, 30 Dec 2020 00:00:00 GMT',
                'Thu, 31 Dec 2020 00:00:00 GMT',
                'Fri, 01 Jan 2021 00:00:00 GMT',
                'Mon, 08 Feb 2021 00:00:00 GMT',
                'Tue, 09 Feb 2021 00:00:00 GMT',
                'Wed, 10 Feb 2021 00:00:00 GMT',
            ],
            timestamp: '13.11.2020, 12:40',
            type: 'K',
        },
        body: {
            name: '10/1',
            short: '10/1',
            schedule: [
                {
                    comment: '',
                    id: '446',
                    lessonIndex: 1,
                    lessonName: 'DE',
                    lessonNameHasChanged: true,
                    room: 'E107',
                    roomHasChanged: true,
                    teacher: 'ESn',
                    teacherHasChanged: false,
                },
                {
                    comment: 'Alles Anders',
                    id: '464',
                    lessonIndex: 8,
                    lessonName: 'sm15',
                    lessonNameHasChanged: false,
                    room: 'HDS2',
                    roomHasChanged: false,
                    teacher: 'XMei',
                    teacherHasChanged: true,
                },
                {
                    comment: '',
                    id: '465',
                    lessonIndex: 8,
                    lessonName: 'sw1',
                    lessonNameHasChanged: false,
                    room: 'BSZ2',
                    roomHasChanged: false,
                    teacher: 'Wal',
                    teacherHasChanged: false,
                },
            ],
        },
        footer: {
            supervisions: null,
        },
    },
};

export const CalendarResponse = {
    calendar: [
        {
            description: '',
            end: '2021-01-19T00:00:00',
            start: '2021-01-18T00:00:00',
            summary: 'Kl. 12 Zeugnisse 12/I',
            uid: '6f2im5dftok9s3ju64gbft38vm@google.com',
        },
        {
            description: '',
            end: '2021-01-19T00:00:00',
            start: '2021-01-18T00:00:00',
            summary: 'Beginn Halbjahr 12/II',
            uid: '27b0usgkfkae1q1uncln345pus@google.com',
        },
        {
            description: '',
            end: '2021-01-23T00:00:00',
            start: '2021-01-18T00:00:00',
            summary: 'B-Woche',
            uid: '320aks47p2j6mcfgkfoth6v8e4@google.com',
        },
        {
            description: '',
            end: '2021-01-30T00:00:00',
            start: '2021-01-25T00:00:00',
            summary: 'A-Woche',
            uid: '3vjs0837vicighqj2a4p1d2e29@google.com',
        },
        {
            description: '',
            end: '2021-02-06T00:00:00',
            start: '2021-02-01T00:00:00',
            summary: 'B-Woche',
            uid: '49535c1jcg18fsi5eqtjh92vka@google.com',
        },
        {
            description: '',
            end: '2021-02-09T00:00:00',
            start: '2021-02-08T00:00:00',
            summary: 'Anmeldung neue 5. Klassen (bis 26.02.2021)',
            uid: '52sl7683caevabbi0a37468iur@google.com',
        },
        {
            description: '',
            end: '2021-02-13T00:00:00',
            start: '2021-02-12T00:00:00',
            summary: 'Kl. 10 Abgabe Facharbeit',
            uid: '7l711ef2uqik6utvs86tdnda0c@google.com',
        },
        {
            description: '',
            end: '2021-02-27T00:00:00',
            start: '2021-02-22T00:00:00',
            summary: 'A-Woche',
            uid: '2ctu89no6surfcla76jou3pubk@google.com',
        },
        {
            description: '',
            end: '2021-02-25T00:00:00',
            start: '2021-02-24T00:00:00',
            summary: 'Kl. 8 Kompetenztest DE',
            uid: '041i3k4d1iies3cojpunltagje@google.com',
        },
        {
            description: '',
            end: '2021-03-02T00:00:00',
            start: '2021-03-01T00:00:00',
            summary: 'Kl. 10 BLF DE',
            uid: '627f9nqkie5je4rfs4nlejr395@google.com',
        },
        {
            description: '',
            end: '2021-03-06T00:00:00',
            start: '2021-03-01T00:00:00',
            summary: 'B-Woche',
            uid: '70kicrmmqu5fiktdi2rulkmr3o@google.com',
        },
        {
            description: '',
            end: '2021-03-04T00:00:00',
            start: '2021-03-03T00:00:00',
            summary: 'Kl. 10 BLF EN',
            uid: '53qsrlvgn05ssl03b9p7r6jq8u@google.com',
        },
        {
            description: '',
            end: '2021-03-06T00:00:00',
            start: '2021-03-05T00:00:00',
            summary: 'Kl. 10 BLF MA',
            uid: '359rrhvna3f5e6i07ote1ppduk@google.com',
        },
        {
            description: '',
            end: '2021-03-13T00:00:00',
            start: '2021-03-08T00:00:00',
            summary: 'A-Woche',
            uid: '0dsu1e81rbk7dnob1ntb06ddg7@google.com',
        },
        {
            description: '',
            end: '2021-03-20T00:00:00',
            start: '2021-03-15T00:00:00',
            summary: 'B-Woche',
            uid: '2le77app31ncv23me44cvnn3tg@google.com',
        },
        {
            description:
                '\n\nKl. 9/1 in der 3./4. Std.Kl. 9/2 in der 5./6. Std.Raum E 10\r\n5',
            end: '2021-03-18T00:00:00',
            start: '2021-03-17T00:00:00',
            summary: 'Kl. 9 Berufsorientierung (3.-6. Std.)',
            uid: '3c7sbjf46kb3rd3j6jp6c9mmsv@google.com',
        },
        {
            description: '',
            end: '2021-03-19T00:00:00',
            start: '2021-03-18T00:00:00',
            summary: 'Känguru-Wettbewerb',
            uid: '018fvmqd3drkndlj693d3u2rt3@google.com',
        },
    ],
};
