import { adminGroup, lehrerGroup, elternGroup, schuelerGroup } from './Accounts';
import { ClientModel } from 'model';

/**
 *
 * Tenants
 *
 */

export const TestTenant: ClientModel = {
    id: 1,
    title: 'DerEineVonHier',
    slug: 'derdiedas',
    createdAt: '2014-03-08 12:00',
    updatedAt: '2014-03-08 12:00',
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
            id: 1,
            isMainDomain: true
        }
    ],
    customTheme: {},
    logoImageFile: null,
    backgroundImageFile: null
};

export const OtherTenant = {
    id: 2,
    title: 'Um andere gehts ja eigentlich hier nie',
    slug: 'andere',
    createdAt: '2014-03-08 12:00',
    updatedAt: '2014-03-08 12:00',
    groups: [],
    customDomains: [],
    logoImageFile: null,
    backgroundImageFile: null
};

/**
 *
 *
 * Categories
 *
 *
 *
 */

export const StartseiteCategory = {
    id: 1,
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
    id: 2,
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
    id: 3,
    sortKey: 5,
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

export const ImpressumCategory = {
    id: 4,
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
    id: 5,
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
    id: 20,
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
    id: 21,
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
    id: 22,
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
    id: 23,
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
    id: 24,
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
    id: 25,
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
    id: 31,
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
    id: 32,
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
    id: 33,
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
    id: 34,
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
