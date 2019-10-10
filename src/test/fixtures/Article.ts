import { ArticleModel } from 'model';
import { SuedAmerikaCategory } from './Tenant';
import { RegisteredUser } from './User';

export const UeberSuedamerika: ArticleModel = {
    id: 1,
    contentModules: [],
    insertedAt: new Date(2018, 5, 1, 18, 0).toISOString(),
    updatedAt: new Date(2019, 9, 11, 6, 0).toISOString(),
    isPinnedToTop: false,
    readyToPublish: true,
    title: 'Mein Artikel',
    preview: 'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.',
    topic: 'La Revolucion',
    category: SuedAmerikaCategory,
    users: [RegisteredUser]
};

export const VivaLaRevolucion: ArticleModel = {
    id: 2,
    contentModules: [],
    insertedAt: new Date(2018, 5, 1, 18, 0).toISOString(),
    updatedAt: new Date(2019, 9, 11, 6, 0).toISOString(),
    isPinnedToTop: false,
    readyToPublish: true,
    title: 'Viva La Revolucion',
    preview: 'lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit. lorem ipsum dolor sit.',
    topic: 'La Revolucion',
    category: SuedAmerikaCategory,
    users: [RegisteredUser]
};