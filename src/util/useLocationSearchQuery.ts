import useRouter from 'use-react-router';

export const useLocationSearchQuery = <
    T extends { [key: string]: string | true } = any
>() => {
    const { location } = useRouter();
    return location.search
        .replace(/^\?/, '')
        .split('&')
        .reduce((prev, keyValuePair) => {
            const [key, val] = keyValuePair.split('=');
            return {
                ...prev,
                [key]: val ? decodeURIComponent(val) : true,
            };
        }, {}) as Partial<T>;
};
