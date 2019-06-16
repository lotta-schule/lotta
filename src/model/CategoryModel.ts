export interface CategoryModel {
    id: string;
    title: string;
    category?: CategoryModel;
}
