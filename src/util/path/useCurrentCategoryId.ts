import useReactRouter from 'use-react-router';

export const useCurrentCategoryId = (): string | null => {
    const { location, match } = useReactRouter();
    console.log(location.pathname);
    if (location.pathname.match(/^\/category/)) {
        return (match.params as any).id;
    }
    // if (location.pathname.match(/^article/)) {
    //     return (match.params as any).id;
    // }
    return null;
}