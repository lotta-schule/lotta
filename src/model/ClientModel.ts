import { CategoryModel } from './CategoryModel';

export interface ClientModel {
    id: string;
    slug: string;
    title: string;
    categories: CategoryModel[];
}
