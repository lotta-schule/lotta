import { find } from 'lodash';
import { ContentModuleModel, ContentModuleType } from '../../model';
import { ContentState } from '../State';
import { AddArticleAction, AddCategoryAction, UpdateContentModuleAction, AddContentModuleAction, ContentActionType } from '../actions/content';

export type ContentActions = AddArticleAction | AddCategoryAction | AddContentModuleAction | UpdateContentModuleAction;

export const initialContentState: ContentState = {
    categories: [
        {
            id: 'C0001',
            title: 'Profil'
        },
        {
            id: 'C0002',
            title: 'GTA'
        },
        {
            id: 'C0003',
            title: 'Projekte'
        },
        {
            id: 'C0004',
            title: 'Fächer'
        },
        {
            id: 'C0005',
            title: 'Material'
        },
        {
            id: 'C0006',
            title: 'Galerien'
        },
    ],
    articles: [
        {
            id: 'A01',
            title: 'And the oskar goes to ...',
            preview: 'Hallo hallo hallo',
            category: {
                id: 'C01',
                title: 'Kategorie'
            },
            modules: [
                {
                    id: 'M01',
                    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                    type: ContentModuleType.Text
                },
                {
                    id: 'M02',
                    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                    type: ContentModuleType.Text
                }
            ]
        },
        {
            id: 'A02',
            title: 'Landesfinale Volleyball WK IV',
            preview: 'Zweimal Silber für die Mannschaften des Christian-Gottfried-Ehrenberg-Gymnasium Delitzsch beim Landesfinale "Jugend trainiert für Europa" im Volleyball. Nach beherztem Kampf im Finale unterlegen ...',
            category: {
                id: 'C01',
                title: 'Kategorie'
            },
            modules: [
                {
                    id: 'M01',
                    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                    type: ContentModuleType.Text
                },
                {
                    id: 'M02',
                    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                    type: ContentModuleType.Text
                }
            ]
        },
        {
            id: 'A03',
            title: 'Der Podcast zum WB 2',
            preview: 'Das Podcastteam hat alle Hochlichter der Veranstaltung in einem originellen Film zusammengeschnitten. Wir beglückwünschen die Sieger und haben unseren Sieger gesondert gefeiert.',
            category: {
                id: 'C01',
                title: 'Kategorie'
            },
            modules: [
                {
                    id: 'M01',
                    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                    type: ContentModuleType.Text
                },
                {
                    id: 'M02',
                    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                    type: ContentModuleType.Text
                }
            ]
        },
        {
            id: 'A04',
            title: 'Der Vorausscheid',
            preview: 'Singen, Schauspielern, Instrumente Spielen - Die Kerndisziplinen von Klienkunst waren auch diese Jahr beim Vorausscheid am 14. Februar vertreten. Wir mischten uns unter die Kandidaten, Techniker und die Jury.',
            category: {
                id: 'C01',
                title: 'Kategorie'
            },
            modules: [
                {
                    id: 'M01',
                    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                    type: ContentModuleType.Text
                },
                {
                    id: 'M02',
                    text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                    type: ContentModuleType.Text
                }
            ]
        },
    ]
};

export const contentReducer = (s: ContentState = initialContentState, action: ContentActions): ContentState => {
    switch (action.type) {
        case ContentActionType.ADD_ARTICLE:
            return {
                ...s,
                articles: [...s.articles, action.article]
            };
        case ContentActionType.ADD_CATEGORY:
            const foundCategory = find(s.articles, { id: action.category.id });
            return foundCategory
                ? {
                    ...s,
                    categories: s.categories.map(category => (category.id === action.category.id ? action.category : category))
                }
                : {
                    ...s,
                    categories: action.category ? s.categories.concat(action.category) : s.categories
                };
        case ContentActionType.ADD_CONTENT_MODULE:
            return {
                ...s,
                articles: s.articles.map(article => ({
                    ...article,
                    modules:
                        article.id === action.articleId
                            ? article.modules.concat([action.contentModule])
                            : article.modules
                }))
            };
        case ContentActionType.UPDATE_CONTENT_MODULE:
            const updateModuleMapFn = (contentModule: ContentModuleModel): ContentModuleModel => {
                if (contentModule.id === action.contentModule.id) {
                    return action.contentModule;
                }
                return contentModule;
            }
            return {
                ...s,
                articles: s.articles.map(page => ({
                    ...page,
                    modules: page.modules.map(updateModuleMapFn)
                }))
            };
        default:
            return s;
    }
};
