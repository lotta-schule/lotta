declare module '@convertkit/slate-lists' {

    import { CorePlugin } from 'slate-react';

    export interface ListsOptions {
        blocks: {
            ordered_list: string;
            unordered_list: string;
            list_item: string;
        };
        classNames: {
            ordered_list: string;
            unordered_list: string;
            list_item: string;
        };
    }

    export const Lists = (options: ListsOptions) => CorePlugin;

    export default Lists;
};
