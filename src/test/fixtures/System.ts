import { adminGroup, lehrerGroup, elternGroup, schuelerGroup } from './Accounts';
import { CalendarWidgetConfig, ClientModel, ScheduleWidgetConfig, WidgetModel, WidgetModelType } from 'model';

/**
 *
 * System
 *
 */

export const system: ClientModel = {
    id: '1', // add ID for cache
    title: 'DerEineVonHier',
    slug: 'derdiedas',
    insertedAt: '2014-03-08 12:00',
    updatedAt: '2014-03-08 12:00',
    host: 'info.lotta.schule',
    groups: [
        adminGroup,
        lehrerGroup,
        elternGroup,
        schuelerGroup
    ],
    customDomains: [
        {
            host: 'chezmoi.fr',
            insertedAt: '2014-12-24 18:00',
            updatedAt: '2014-12-24 18:00',
            id: '1',
            isMainDomain: true
        }
    ],
    customTheme: {},
    logoImageFile: null,
    backgroundImageFile: null
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
    groups: []
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
    groups: []
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
    groups: []
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
    groups: []
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
    groups: []
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
    ArbeitsblätterCategory
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
        password: 'p@ssw0rd'
    }
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
        password: 'p@ssw0rd'
    }
};

export const CalendarKlassenarbeiten: WidgetModel<CalendarWidgetConfig> = {
    id: '91801',
    title: 'VP Lehrer',
    type: WidgetModelType.VPlan,
    groups: [],
    configuration: {
        calendars: [
            {
                url: 'http://calendar.com/cal.ical',
                color: 'green',
                name: 'Klassenarbeiten 5-6'
            },
            {
                url: 'http://calendar.com/cal2.ical',
                color: 'green',
                name: 'Klassenarbeiten 7-10'
            }
        ]
    }
};

export const ScheduleResponse = {
    "schedule": {
        "id": "SCHEDULE:111",
        "head": {
            "date": "Montag, 16. November 2020",
            "filename": "PlanKl20201116.xml",
            "skipDates": [
                "Tue, 17 Nov 2020 00:00:00 GMT",
                "Thu, 19 Nov 2020 00:00:00 GMT",
                "Fri, 20 Nov 2020 00:00:00 GMT",
                "Wed, 23 Dec 2020 00:00:00 GMT",
                "Thu, 24 Dec 2020 00:00:00 GMT",
                "Fri, 25 Dec 2020 00:00:00 GMT",
                "Mon, 28 Dec 2020 00:00:00 GMT",
                "Tue, 29 Dec 2020 00:00:00 GMT",
                "Wed, 30 Dec 2020 00:00:00 GMT",
                "Thu, 31 Dec 2020 00:00:00 GMT",
                "Fri, 01 Jan 2021 00:00:00 GMT",
                "Mon, 08 Feb 2021 00:00:00 GMT",
                "Tue, 09 Feb 2021 00:00:00 GMT",
                "Wed, 10 Feb 2021 00:00:00 GMT",
            ],
            "timestamp": "13.11.2020, 12:40",
            "type": "K"
        },
        "body": {
            "name": "10/1",
            "short": "10/1",
            "schedule": [
                {
                    "comment": "",
                    "id": "446",
                    "lessonIndex": 1,
                    "lessonName": "DE",
                    "lessonNameHasChanged": true,
                    "room": "E107",
                    "roomHasChanged": true,
                    "teacher": "ESn",
                    "teacherHasChanged": false
                },
                {
                    "comment": "Alles Anders",
                    "id": "464",
                    "lessonIndex": 8,
                    "lessonName": "sm15",
                    "lessonNameHasChanged": false,
                    "room": "HDS2",
                    "roomHasChanged": false,
                    "teacher": "XMei",
                    "teacherHasChanged": true
                },
                {
                    "comment": "",
                    "id": "465",
                    "lessonIndex": 8,
                    "lessonName": "sw1",
                    "lessonNameHasChanged": false,
                    "room": "BSZ2",
                    "roomHasChanged": false,
                    "teacher": "Wal",
                    "teacherHasChanged": false
                }
            ]
        },
        "footer": {
            "supervisions": null
        },
    }
};
